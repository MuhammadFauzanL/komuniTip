import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import * as bcrypt from 'bcryptjs';
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
    const payload = { sub: user.id, email: user.email, slug: user.username_slug };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nama: user.nama_lengkap,
        slug: user.username_slug,
        email: user.email,
        provider: user.provider,
      }
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

    // 3. Generate Username Slug
    let baseSlug = dto.nama_lengkap.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'user';
    let slug = baseSlug;
    let counter = 1;
    while (await this.prisma.user.findUnique({ where: { username_slug: slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // 4. Simpan ke Database
    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        nama_lengkap: dto.nama_lengkap,
        password_hash: hashedPassword,
        username_slug: slug,
        provider: 'local',
      }
    });

    // 5. Kembalikan Response dan berikan akses token
    return this.generateAuthResponse(newUser);
  }

  async login(dto: LoginDto) {
    // 1. Cek user ada atau tidak
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });

    if (!user) {
      throw new UnauthorizedException('Email atau Password salah');
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
        // Generate unique slug dari nama
        let baseSlug = name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'user';
        let slug = baseSlug;
        let counter = 1;
        while (await this.prisma.user.findUnique({ where: { username_slug: slug } })) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }

        user = await this.prisma.user.create({
          data: {
            email,
            nama_lengkap: name || 'Google User',
            username_slug: slug,
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
}
