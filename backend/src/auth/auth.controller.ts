import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { CompleteUsernameDto } from './dto/complete-username.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { LoginAttemptService } from './login-attempt.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import type { AuthenticatedRequest } from './auth.types';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly loginAttemptService: LoginAttemptService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Mendaftar secara manual menggunakan Email & Password' })
  @ApiResponse({ status: 201, description: 'Akun berhasil didaftarkan dan login', type: AuthResponseDto })
  @ApiResponse({ status: 400, description: 'Email sudah terpakai' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login secara manual menggunakan Email & Password' })
  @ApiResponse({ status: 200, description: 'Berhasil login', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Email atau Password salah' })
  @ApiResponse({ status: 429, description: 'Terlalu banyak percobaan login gagal sementara' })
  async login(@Body() loginDto: LoginDto, @Request() req: AuthenticatedRequest) {
    const clientIp = this.resolveClientIp(req);
    await this.loginAttemptService.assertNotLocked(loginDto.identifier, clientIp);

    try {
      const authResponse = await this.authService.login(loginDto);
      await this.loginAttemptService.reset(loginDto.identifier, clientIp);
      return authResponse;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        await this.loginAttemptService.recordFailure(loginDto.identifier, clientIp);
      }
      throw error;
    }
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login / Register menggunakan akun Google (berikan id_token dari Frontend SDK)' })
  @ApiResponse({ status: 200, description: 'Berhasil login/register, JWT token terbit', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Token Google tidak valid / kadaluarsa' })
  async googleAuth(@Body() googleAuthDto: GoogleAuthDto) {
    return this.authService.verifyGoogleTokenAndLogin(googleAuthDto.id_token);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kirim request reset password via email' })
  @ApiResponse({ status: 200, description: 'Link reset berhasil dikirim' })
  @ApiResponse({ status: 400, description: 'Email tidak terdaftar' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('onboarding')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Menyelesaikan Onboarding (Memasukkan Username) bagi pengguna pendaftar Google baru' })
  @ApiResponse({ status: 200, description: 'Username berhasil tersimpan, menerima JWT baru', type: AuthResponseDto })
  @ApiResponse({ status: 400, description: 'Username sudah digunakan' })
  @ApiResponse({ status: 401, description: 'Sesi tidak valid / belum login' })
  async completeOnboarding(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CompleteUsernameDto
  ) {
    return this.authService.completeOnboarding(req.user.id, dto.username);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mengatur ulang password menggunakan token dari email' })
  @ApiResponse({ status: 200, description: 'Password berhasil diperbarui' })
  @ApiResponse({ status: 400, description: 'Token tidak valid atau kadaluarsa' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.new_password);
  }

  // GET untuk mengambil data profile
  @Get('me')
  @UseGuards(AuthGuard('jwt')) 
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mengambil data profil terbaru untuk Dashboard' })
  @ApiResponse({ status: 200, description: 'Profil berhasil diambil', type: ProfileResponseDto })
  async getMe(@Request() req: AuthenticatedRequest) {
    return this.authService.getMyProfile(req.user.id);
  }
  
  // PATCH untuk update profile
  @Patch('me')
  @UseGuards(AuthGuard('jwt')) 
  @ApiOperation({ summary: 'Memperbarui data profil kreator' })
  @ApiResponse({ status: 200, description: 'Profil berhasil diperbarui', type: AuthResponseDto })
  async updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() body: UpdateProfileDto
  ) {
    return this.authService.updateProfile(req.user.id, body);
  }

  // Alias sementara untuk backward compatibility frontend lama
  @Patch('me/update')
  @UseGuards(AuthGuard('jwt')) 
  @ApiOperation({ summary: 'Alias legacy untuk update profile' })
  @ApiResponse({ status: 200, description: 'Profil berhasil diperbarui', type: AuthResponseDto })
  async updateProfileLegacy(
    @Request() req: AuthenticatedRequest,
    @Body() body: UpdateProfileDto
  ) {
    return this.authService.updateProfile(req.user.id, body);
  }

  private resolveClientIp(req: {
    headers?: Record<string, string | string[] | undefined>;
    ip?: string;
  }) {
    const forwardedFor = req.headers?.['x-forwarded-for'];

    if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
      return forwardedFor.split(',')[0].trim();
    }

    if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
      return forwardedFor[0].trim();
    }

    return req.ip || 'unknown';
  }
}
