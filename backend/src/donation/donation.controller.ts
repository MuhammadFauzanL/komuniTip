import {
  Controller, Get, Post, Body, Param, Query,
  HttpCode, HttpStatus, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SkipThrottle } from '@nestjs/throttler';
import { DonationService } from './donation.service';
import { CreateDonationDto } from './dto/create-donation.dto';

@ApiTags('Donation')
@Controller()
export class DonationController {
  constructor(private readonly donationService: DonationService) {}

  // ──────────────────────────────────────────────
  // PUBLIC ENDPOINTS (untuk donatur, tanpa login)
  // ──────────────────────────────────────────────

  @Get('donate/:username')
  @SkipThrottle()
  @ApiOperation({ summary: 'Mendapatkan profil publik streamer untuk halaman donasi' })
  @ApiParam({ name: 'username', example: 'budi_gamer' })
  @ApiResponse({ status: 200, description: 'Data profil publik ditemukan' })
  @ApiResponse({ status: 404, description: 'Kreator tidak ditemukan' })
  async getStreamerProfile(@Param('username') username: string) {
    return this.donationService.getStreamerPublicProfile(username);
  }

  @Post('donate/:username')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mengirim donasi ke streamer (AI moderation → payment)',
    description: 'Pesan donatur akan diperiksa oleh AI sebelum proses pembayaran dilanjutkan.',
  })
  @ApiParam({ name: 'username', example: 'budi_gamer' })
  @ApiResponse({ status: 200, description: 'Donasi diterima, lanjut ke pembayaran' })
  @ApiResponse({ status: 400, description: 'Pesan diblokir oleh AI moderation' })
  @ApiResponse({ status: 404, description: 'Kreator tidak ditemukan' })
  async createDonation(
    @Param('username') username: string,
    @Body() dto: CreateDonationDto,
  ) {
    return this.donationService.createDonation(username, dto);
  }

  // ──────────────────────────────────────────────
  // PROTECTED ENDPOINTS (untuk streamer, perlu login)
  // ──────────────────────────────────────────────

  @Get('donation/my')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Mengambil riwayat donasi untuk dashboard streamer' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({ status: 200, description: 'Daftar donasi berhasil diambil' })
  async getMyDonations(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.donationService.getMyDonations(
      req.user.id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get('donation/stats')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Mengambil statistik donasi untuk dashboard streamer' })
  @ApiResponse({ status: 200, description: 'Statistik berhasil diambil' })
  async getMyDonationStats(@Request() req) {
    return this.donationService.getMyDonationStats(req.user.id);
  }
}
