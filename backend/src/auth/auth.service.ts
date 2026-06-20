import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private googleClient: OAuth2Client;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  // ─── HELPER: Generate internal JWT ───
  private generateAuthResponse(user: {
    id: string;
    email: string;
    nama_lengkap: string;
    username: string | null;
    provider?: string;
    role?: string;
    saldo_aktif?: number | { toString(): string };
    saldo_tertahan?: number | { toString(): string };
    kategori?: string | null;
    bio?: string | null;
    instagram?: string | null;
    youtube?: string | null;
    twitter?: string | null;
  }) {
    // Memasukkan role ke dalam Payload JWT agar ikut dienkripsi
    const payload = { 
      sub: user.id, 
      email: user.email, 
      username: user.username,
      role: user.role 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nama_lengkap: user.nama_lengkap,
        username: user.username,
        email: user.email,
        provider: user.provider,
        role: user.role, 
        saldo_aktif: Number(user.saldo_aktif ?? 0),
        saldo_tertahan: Number(user.saldo_tertahan ?? 0),
        kategori: user.kategori,
        bio: user.bio,
        instagram: user.instagram,
        youtube: user.youtube,
        twitter: user.twitter,
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
      },
      select: {
        id: true,
        email: true,
        nama_lengkap: true,
        username: true,
        provider: true,
        role: true,
        saldo_aktif: true,
        saldo_tertahan: true,
        kategori: true,
        bio: true,
        instagram: true,
        youtube: true,
        twitter: true,
      },
    });

    // 5. Kembalikan Response dan berikan akses token
    return this.generateAuthResponse(newUser);
  }

  async login(dto: LoginDto) {
    const normalizedIdentifier = dto.identifier.trim().toLowerCase();

    // 1. Cek user ada atau tidak menggunakan Email atau Username
    const isEmail = normalizedIdentifier.includes('@');
    const user = await this.prisma.user.findUnique({
      where: isEmail ? { email: normalizedIdentifier } : { username: normalizedIdentifier }
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
        select: {
          id: true,
          email: true,
          nama_lengkap: true,
          username: true,
          provider: true,
          google_id: true,
          role: true,
          saldo_aktif: true,
          saldo_tertahan: true,
          kategori: true,
          bio: true,
          instagram: true,
          youtube: true,
          twitter: true,
        },
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
          select: {
            id: true,
            email: true,
            nama_lengkap: true,
            username: true,
            provider: true,
            google_id: true,
            role: true,
            saldo_aktif: true,
            saldo_tertahan: true,
            kategori: true,
            bio: true,
            instagram: true,
            youtube: true,
            twitter: true,
          },
        });
      }

      // 4. Jika terdaftar namun belum login via google sebelumnya, update!
      if (user && !user.google_id) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { google_id, provider: 'google' },
          select: {
            id: true,
            email: true,
            nama_lengkap: true,
            username: true,
            provider: true,
            google_id: true,
            role: true,
            saldo_aktif: true,
            saldo_tertahan: true,
            kategori: true,
            bio: true,
            instagram: true,
            youtube: true,
            twitter: true,
          },
        });
      }

      // 5. Terbitkan Super Token (JWT) milik aplikasi kita
      return this.generateAuthResponse(user);

    } catch (error) {
      this.logger.error(
        'Google auth verification failed',
        error instanceof Error ? error.stack : undefined,
      );
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
      select: {
        id: true,
        email: true,
        nama_lengkap: true,
        username: true,
        provider: true,
        role: true,
        saldo_aktif: true,
        saldo_tertahan: true,
        kategori: true,
        bio: true,
        instagram: true,
        youtube: true,
        twitter: true,
      },
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

    // Best practice: selalu kembalikan response yang sama
    // agar attacker tidak bisa mengetahui email mana yang terdaftar
    if (!user) {
      return { message: 'Jika email terdaftar, link reset password telah dikirim ke email kamu' };
    }

    // Jika akun Google-only, jangan bocorkan info — kembalikan pesan yang sama
    if (user.provider === 'google' && !user.password_hash) {
      return { message: 'Jika email terdaftar, link reset password telah dikirim ke email kamu' };
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

    // 5. Kirim email dengan link reset
    await this.mailService.sendPasswordResetEmail(user.email, user.nama_lengkap, resetToken);

    return {
      message: 'Link reset password telah dikirim ke email kamu',
    };
  }

  // ─── RESET PASSWORD ───

  async resetPassword(token: string, new_password: string) {
    // 1. Cari user dengan token tersebut
    const user = await this.prisma.user.findFirst({
      where: {
        reset_token: token,
        reset_token_expires: { gt: new Date() }, // Belum kadaluarsa
      },
    });

    if (!user) {
      throw new BadRequestException('Token reset tidak valid atau sudah kadaluarsa');
    }

    // 2. Hash password baru
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(new_password, saltRounds);

    // 3. Update password dan hapus token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password_hash: hashedPassword,
        reset_token: null,
        reset_token_expires: null,
      },
    });

    return { message: 'Password berhasil diperbarui. Silakan login kembali.' };
  }

  // ─── AMBIL PROFIL (DASHBOARD) ───
  async getMyProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
          select: {
        id: true,
        email: true,
        nama_lengkap: true,
        username: true,
        provider: true,
        role: true,
        saldo_aktif: true,
        saldo_tertahan: true,
        kategori: true,
        bio: true,
        instagram: true,
        youtube: true,
        twitter: true,
        createdAt: true,
      }
    });

    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    return {
      ...user,
      saldo_aktif: Number(user.saldo_aktif),
      saldo_tertahan: Number(user.saldo_tertahan),
    };
  }

  // ─── UPDATE PROFIL KREATOR ───
    async updateProfile(
      userId: string,
      data: UpdateProfileDto,
    ) {
    // Cegah kembar username
    if (data.username) {
      const existing = await this.prisma.user.findUnique({ where: { username: data.username } });
      if (existing && existing.id !== userId) {
        throw new BadRequestException('Username sudah digunakan oleh kreator lain');
      }
    }
    // Update database
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
     nama_lengkap: data.nama_lengkap,
        username: data.username,
        kategori: data.kategori,
        bio: data.bio,
        instagram: data.instagram,
        youtube: data.youtube,
        twitter: data.twitter,
      },
      select: {
        id: true,
        email: true,
        nama_lengkap: true,
        username: true,
        provider: true,
        role: true,
        saldo_aktif: true,
        saldo_tertahan: true,
        kategori: true,
        bio: true,
        instagram: true,
        youtube: true,
        twitter: true,

      }
    });
    return this.generateAuthResponse(updatedUser);
  }

}
