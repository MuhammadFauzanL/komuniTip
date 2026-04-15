import {
  Controller, Post, Body, Headers, Param,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiHeader } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { PaymentService } from './payment.service';

@ApiTags('Payment')
@Controller()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Membuat invoice pembayaran untuk donasi yang sudah lolos AI moderation.
   * Dipanggil setelah POST /donate/:username berhasil.
   */
  @Post('payment/create-invoice/:donationId')
  @ApiOperation({ summary: 'Membuat invoice Xendit untuk donasi' })
  @ApiParam({ name: 'donationId', description: 'ID donasi dari POST /donate/:username' })
  @ApiResponse({ status: 200, description: 'Invoice URL berhasil dibuat' })
  async createInvoice(@Param('donationId') donationId: string) {
    return this.paymentService.createInvoice(donationId);
  }

  /**
   * Webhook endpoint yang dipanggil oleh Xendit saat status pembayaran berubah.
   * 
   * Best Practice:
   * - SkipThrottle: jangan rate-limit webhook dari Xendit
   * - Verifikasi x-callback-token header
   * - Return 200 OK agar Xendit tidak retry
   */
  @Post('payment/webhook/xendit')
  @SkipThrottle()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook callback dari Xendit' })
  @ApiHeader({ name: 'x-callback-token', description: 'Xendit webhook verification token' })
  async handleWebhook(
    @Headers('x-callback-token') callbackToken: string,
    @Body() payload: any,
  ) {
    return this.paymentService.handleWebhook(callbackToken, payload);
  }
}
