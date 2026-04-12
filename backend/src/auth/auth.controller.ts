import { Controller, Post,Patch, Get, Body, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
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

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Mendaftar secara manual menggunakan Email & Password' })
  @ApiResponse({ status: 201, description: 'Akun berhasil didaftarkan dan login' })
  @ApiResponse({ status: 400, description: 'Email sudah terpakai' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login secara manual menggunakan Email & Password' })
  @ApiResponse({ status: 200, description: 'Berhasil login' })
  @ApiResponse({ status: 401, description: 'Email atau Password salah' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login / Register menggunakan akun Google (berikan id_token dari Frontend SDK)' })
  @ApiResponse({ status: 200, description: 'Berhasil login/register, JWT token terbit' })
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
  @ApiResponse({ status: 200, description: 'Username berhasil tersimpan, menerima JWT baru' })
  @ApiResponse({ status: 400, description: 'Username sudah digunakan' })
  @ApiResponse({ status: 401, description: 'Sesi tidak valid / belum login' })
  async completeOnboarding(
    @Request() req,
    @Body() dto: CompleteUsernameDto
  ) {
    // req.user terisi secara otomatis oleh JwtAuthGuard melalui jwt.strategy.ts
    // JwtStrategy mengembalikan object user dari database dengan field .id
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
  async getMe(@Request() req) {
    return this.authService.getMyProfile(req.user.id);
  }
  
  // PATCH untuk update profile
  @Patch('me/update')
  @UseGuards(AuthGuard('jwt')) 
  @ApiOperation({ summary: 'Memperbarui data profil (Nama Tampilan & Username)' })
  async updateProfile(
    @Request() req,
    @Body() body: UpdateProfileDto
  ) {
    return this.authService.updateProfile(req.user.id, body);
  }
}

