import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import type { AuthenticatedRequest } from '../auth/auth.types';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { CreateWithdrawalResponseDto, WithdrawalListResponseDto } from './dto/withdrawal-response.dto';
import { WithdrawalService } from './withdrawal.service';

@ApiTags('Withdrawals')
@Controller('withdrawals')
@UseGuards(AuthGuard('jwt'))
export class WithdrawalController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  @Post('my')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Membuat request withdraw baru untuk streamer yang sedang login' })
  @ApiResponse({ status: 201, description: 'Request withdraw berhasil dibuat', type: CreateWithdrawalResponseDto })
  async createMyWithdrawal(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateWithdrawalDto,
  ) {
    return this.withdrawalService.createWithdrawal(req.user.id, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Mengambil ringkasan saldo dan riwayat withdraw milik streamer' })
  @ApiResponse({ status: 200, description: 'Riwayat withdraw berhasil diambil', type: WithdrawalListResponseDto })
  async getMyWithdrawals(@Request() req: AuthenticatedRequest) {
    return this.withdrawalService.getMyWithdrawals(req.user.id);
  }

  @Patch('my/:withdrawalId/cancel')
  @ApiOperation({ summary: 'Membatalkan request withdraw yang masih pending' })
  @ApiResponse({ status: 200, description: 'Request withdraw berhasil dibatalkan', type: CreateWithdrawalResponseDto })
  async cancelMyWithdrawal(
    @Request() req: AuthenticatedRequest,
    @Param('withdrawalId') withdrawalId: string,
  ) {
    return this.withdrawalService.cancelMyWithdrawal(req.user.id, withdrawalId);
  }
}
