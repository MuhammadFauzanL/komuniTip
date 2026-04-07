import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

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
}
