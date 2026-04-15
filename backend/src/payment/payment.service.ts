import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { DonationGateway } from '../socket/donation.gateway';
import Xendit from 'xendit-node';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private xenditClient: Xendit;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private donationGateway: DonationGateway,
  ) {
    const secretKey = this.configService.get<string>('XENDIT_SECRET_KEY');
    if (!secretKey) {
      this.logger.warn('XENDIT_SECRET_KEY not set. Payment will not work.');
    }
    this.xenditClient = new Xendit({ secretKey: secretKey || '' });
  }

  /**
   * Membuat invoice Xendit untuk pembayaran donasi.
   * 
   * Flow:
   * 1. Cari donasi yang sudah PENDING (sudah lolos AI moderation)
   * 2. Buat invoice Xendit via API
   * 3. Simpan payment_gateway_ref ke database
   * 4. Return invoice URL → donatur diarahkan ke sini untuk bayar
   */
  async createInvoice(donationId: string) {
    // 1. Ambil data donasi
    const donation = await this.prisma.donation.findUnique({
      where: { id: donationId },
      include: { streamer: { select: { nama_lengkap: true, username: true } } },
    });

    if (!donation) {
      throw new BadRequestException('Donasi tidak ditemukan');
    }

    if (donation.status !== 'PENDING') {
      throw new BadRequestException('Donasi sudah diproses sebelumnya');
    }

    // 2. Buat invoice Xendit
    const externalId = `komunitip_${donation.id}`;
    
    try {
      const invoice = await this.xenditClient.Invoice.createInvoice({
        data: {
          externalId: externalId,
          amount: Number(donation.jumlah),
          description: `Donasi untuk ${donation.streamer.nama_lengkap} dari ${donation.nama_donatur}`,
          currency: 'IDR',
          invoiceDuration: 3600, // 1 jam expired
          customer: {
            givenNames: donation.nama_donatur,
            email: donation.email_donatur || undefined,
          },
          successRedirectUrl: `${this.configService.get('FRONTEND_URL')}/${donation.streamer.username}?success=true`,
          failureRedirectUrl: `${this.configService.get('FRONTEND_URL')}/${donation.streamer.username}?failed=true`,
          items: [
            {
              name: `Donasi ke ${donation.streamer.nama_lengkap}`,
              quantity: 1,
              price: Number(donation.jumlah),
            },
          ],
        },
      });

      // 3. Simpan referensi invoice ke database
      await this.prisma.donation.update({
        where: { id: donationId },
        data: {
          payment_gateway_ref: externalId,
        },
      });

      this.logger.log(
        `💳 Invoice created: ${externalId} → ${invoice.invoiceUrl}`,
      );

      // 4. Return invoice URL
      return {
        invoice_url: invoice.invoiceUrl,
        invoice_id: invoice.id,
        external_id: externalId,
        amount: Number(donation.jumlah),
        expiry_date: invoice.expiryDate,
      };
    } catch (error) {
      this.logger.error(`Xendit invoice error: ${error.message}`);
      throw new BadRequestException('Gagal membuat invoice pembayaran. Silakan coba lagi.');
    }
  }

  /**
   * Handle webhook callback dari Xendit saat pembayaran selesai.
   * 
   * Flow:
   * 1. Verifikasi webhook token (pastikan benar dari Xendit)
   * 2. Cari donasi berdasarkan external_id
   * 3. Jika PAID → update status + tambah saldo streamer (atomic)
   * 4. Jika EXPIRED → update status ke FAILED
   *
   * Best Practice: Idempotent — jika webhook dikirim 2x, 
   * donasi yang sudah SUCCESS tidak akan diupdate lagi.
   */
  async handleWebhook(callbackToken: string, payload: any) {
    // 1. Verifikasi token
    const expectedToken = this.configService.get<string>('XENDIT_WEBHOOK_TOKEN');
    if (callbackToken !== expectedToken) {
      this.logger.warn(`⚠️ Invalid webhook token: ${callbackToken}`);
      throw new BadRequestException('Invalid webhook token');
    }

    const { external_id, status, payment_method, paid_amount } = payload;

    this.logger.log(
      `📩 Webhook received: external_id=${external_id}, status=${status}`,
    );

    // 2. Cari donasi
    const donation = await this.prisma.donation.findUnique({
      where: { payment_gateway_ref: external_id },
      include: { streamer: { select: { username: true } } },
    });

    if (!donation) {
      this.logger.warn(`Donation not found for external_id: ${external_id}`);
      return { status: 'IGNORED', message: 'Donation not found' };
    }

    // Idempotent check — jangan proses ulang yang sudah SUCCESS
    if (donation.status === 'SUCCESS') {
      this.logger.log(`Donation ${donation.id} already SUCCESS, skipping.`);
      return { status: 'ALREADY_PROCESSED' };
    }

    // 3. Handle status
    if (status === 'PAID') {
      // Atomic transaction: update donasi + tambah saldo streamer
      await this.prisma.$transaction([
        this.prisma.donation.update({
          where: { id: donation.id },
          data: {
            status: 'SUCCESS',
            payment_method: payment_method || 'UNKNOWN',
            paid_at: new Date(),
          },
        }),
        this.prisma.user.update({
          where: { id: donation.streamerId },
          data: {
            saldo_aktif: { increment: paid_amount || Number(donation.jumlah) },
          },
        }),
      ]);

      this.logger.log(
        `✅ Donation ${donation.id} SUCCESS! Rp ${donation.jumlah} added to streamer saldo.`,
      );

      // 4. Emit WebSocket event untuk overlay alert
      try {
        const username = donation.streamer?.username;
        if (username) {
          this.donationGateway.emitDonationAlert(username, {
            donation_id: donation.id,
            nama_donatur: donation.nama_donatur,
            jumlah: Number(donation.jumlah),
            pesan: donation.pesan,
          });
        }
      } catch (err) {
        this.logger.error(`Failed to emit socket alert: ${err.message}`);
      }
      
      return { status: 'SUCCESS', donation_id: donation.id };
    }

    if (status === 'EXPIRED') {
      await this.prisma.donation.update({
        where: { id: donation.id },
        data: { status: 'FAILED' },
      });

      this.logger.log(`❌ Donation ${donation.id} EXPIRED.`);
      return { status: 'EXPIRED', donation_id: donation.id };
    }

    return { status: 'IGNORED', message: `Unknown status: ${status}` };
  }
}
