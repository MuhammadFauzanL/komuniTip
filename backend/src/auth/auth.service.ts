import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  // ─── HELPER: Generate internal JWT ───
  private generateAuthResponse(user: any) {
    const payload = { sub: user.id, email: user.email, username: user.username };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nama: user.nama_lengkap,
        username: user.username,
        email: user.email,
        provider: user.provider,
      },
      require_onboarding: user.username === null,
    };
  }

  // ─── LOGIN & REGISTER MANUAL (LOKAL) ───

  async register(dto: RegisterDto) {
    // 1. Cek apakah email sudah terdaftar
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });

    if (existingUser) {
      if (existingUser.provider === 'google') {
        throw new BadRequestException('Email ini sudah terhubung dengan akun Google. Silakan klik tombol "Lanjutkan dengan Google"');
      }
      throw new BadRequestException('Email sudah terdaftar. Silakan login.');
    }

    // 2. Hash Password untuk Keamanan
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    // 3. Cek Username Unik
    const existingUsername = await this.prisma.user.findUnique({
      where: { username: dto.username }
    });
    if (existingUsername) {
      throw new BadRequestException('Username sudah digunakan. Silakan pilih yang lain.');
    }

    // 4. Simpan ke Database
    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        nama_lengkap: dto.nama_lengkap,
        password_hash: hashedPassword,
        username: dto.username,
        provider: 'local',
      }
    });

    // 5. Kembalikan Response dan berikan akses token
    return this.generateAuthResponse(newUser);
  }

  async login(dto: LoginDto) {
    // 1. Cek user ada atau tidak menggunakan Email atau Username
    const isEmail = dto.identifier.includes('@');
    const user = await this.prisma.user.findFirst({
      where: isEmail ? { email: dto.identifier } : { username: dto.identifier }
    });

    if (!user) {
      throw new UnauthorizedException('Email/Username atau Password salah');
    }

    // 2. Jika user ini aslinya daftar lewat google (passwordnya kosong), tolak!
    if (user.provider === 'google' || !user.password_hash) {
      throw new UnauthorizedException('Akun ini terdaftar via Google. Silakan Sign In menggunakan Google.');
    }

    // 3. Verifikasi Password Kriptografik
    const isPasswordMatch = await bcrypt.compare(dto.password, user.password_hash);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Email atau Password salah');
    }

    // 4. Berhasil? Terbitkan Token
    return this.generateAuthResponse(user);
  }


  // ─── LOGIN & REGISTER GOOGLE OAUTH ───

  async verifyGoogleTokenAndLogin(idToken: string) {
    try {
      // 1. Verifikasi token ke server Google
      const ticket = await this.googleClient.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      
      if (!payload || !payload.email) {
        throw new UnauthorizedException('Invalid Google Token payload');
      }

      const { email, name, sub: google_id } = payload;

      // 2. Cek apakah user sudah terdaftar di database kita
      let user = await this.prisma.user.findUnique({
        where: { email },
      });

      // 3. Jika belum terdaftar, otomatis daftarkan (Register)
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email,
            nama_lengkap: name || 'Google User',
            username: null, // Dibiarkan null agar masuk ke Onboarding
            provider: 'google',
            google_id: google_id,
          },
        });
      }

      // 4. Jika terdaftar namun belum login via google sebelumnya, update!
      if (user && !user.google_id) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { google_id, provider: 'google' },
        });
      }

      // 5. Terbitkan Super Token (JWT) milik aplikasi kita
      return this.generateAuthResponse(user);

    } catch (error) {
      throw new UnauthorizedException('Token Google ditolak atau kadaluarsa');
    }
  }

  // ─── COMPLETE ONBOARDING ───

  async completeOnboarding(userId: string, username: string) {
    // Cek ketersediaan username
    const existing = await this.prisma.user.findUnique({ where: { username } });
    if (existing) {
      throw new BadRequestException('Username sudah digunakan');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { username },
    });

    // Generate token baru dengan username yang sudah update
    return this.generateAuthResponse(user);
  }


  // ─── FORGOT PASSWORD ───

  async forgotPassword(email: string) {
    // 1. Cek apakah email terdaftar
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('Email tidak terdaftar di sistem kami');
    }

    // 2. Jika akun Google-only, tolak
    if (user.provider === 'google' && !user.password_hash) {
      throw new BadRequestException(
        'Akun ini terdaftar via Google. Silakan login menggunakan Google.',
      );
    }

    // 3. Generate reset token (secure random UUID)
    const resetToken = randomUUID();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 jam

    // 4. Simpan token ke database
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        reset_token: resetToken,
        reset_token_expires: resetExpires,
      },
    });

    // 5. Di production: kirim email dengan link reset
    // Untuk sekarang: return token untuk development/testing
    return {
      message: 'Link reset password telah dikirim ke email kamu',
      // TODO: Hapus reset_token dari response setelah email service aktif
      ...(process.env.NODE_ENV !== 'production' && { reset_token: resetToken }),
    };
  }
}
