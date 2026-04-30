import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiModerationService } from '../ai/ai-moderation.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { PaymentService } from '../payment/payment.service';

@Injectable()
export class DonationService {
  private readonly logger = new Logger(DonationService.name);

  constructor(
    private prisma: PrismaService,
    private aiModeration: AiModerationService,
    private paymentService: PaymentService,
  ) {}

  /**
   * Mengambil data publik streamer untuk halaman donasi.
   * Hanya mengembalikan field yang boleh dilihat publik (tanpa email, saldo, dll).
   * 
   * Best Practice: Select hanya field yang dibutuhkan (data minimization)
   */
  async getStreamerPublicProfile(username: string) {
    const streamer = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        nama_lengkap: true,
        username: true,
        kategori: true,
        bio: true,
        instagram: true,
        youtube: true,
        twitter: true,
      },
    });

    if (!streamer) {
      throw new NotFoundException('Kreator tidak ditemukan');
    }

    return streamer;
  }

  /**
   * Flow utama pembuatan donasi:
   * 
   * 1. Cari streamer berdasarkan username
   * 2. Jalankan AI Moderation pada nama + pesan
   * 3. Jika BLOCKED → simpan record dengan status BLOCKED, return error
   * 4. Jika SAFE → simpan record dengan status PENDING
   * 5. Buat invoice pembayaran
   * 6. Return data checkout untuk frontend
   * 
   * Best Practice:
   * - Pre-payment validation (AI check SEBELUM bayar)
   * - Menyimpan semua percobaan donasi (termasuk yang diblokir) untuk audit
   * - Separation of concerns: AI logic di service terpisah
   */
  async createDonation(username: string, dto: CreateDonationDto) {
    // 1. Cari streamer
    const streamer = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true, nama_lengkap: true },
    });

    if (!streamer) {
      throw new NotFoundException('Kreator tidak ditemukan');
    }

    // 2. AI Moderation — cek nama dan pesan
    this.logger.log(`🔍 Moderating donation for streamer "${username}" from "${dto.nama_donatur}"`);
    
    const moderationResult = await this.aiModeration.moderateText(
      dto.nama_donatur,
      dto.pesan || '',
    );

    // 3. Jika BLOCKED — simpan record, tapi tolak donasi
    if (!moderationResult.safe) {
      this.logger.warn(
        `🚫 Donation BLOCKED: "${dto.nama_donatur}" → "${dto.pesan}" | Reason: ${moderationResult.reason}`,
      );

      // Simpan ke database untuk audit trail (status: BLOCKED)
      await this.prisma.donation.create({
        data: {
          streamerId: streamer.id,
          nama_donatur: dto.nama_donatur,
          email_donatur: dto.email_donatur,
          pesan: dto.pesan,
          jumlah: dto.jumlah,
          status: 'BLOCKED',
          ai_status: 'BLOCKED',
          ai_reason: moderationResult.reason || 'Konten terdeteksi tidak pantas',
        },
      });

      throw new BadRequestException({
        blocked: true,
        reason: moderationResult.reason || 'Pesan Anda mengandung konten yang tidak diizinkan.',
      });
    }

    // 4. SAFE — buat donation record (status: PENDING, menunggu pembayaran)
    this.logger.log(`✅ Donation APPROVED: "${dto.nama_donatur}" → Rp ${dto.jumlah}`);

    const donation = await this.prisma.donation.create({
      data: {
        streamerId: streamer.id,
        nama_donatur: dto.nama_donatur,
        email_donatur: dto.email_donatur,
        pesan: dto.pesan,
        jumlah: dto.jumlah,
        status: 'PENDING',
        ai_status: 'SAFE',
      },
    });

    let invoice;
    try {
      invoice = await this.paymentService.createInvoice(donation.id);
    } catch (error) {
      this.logger.error(
        `❌ Failed to create invoice for donation ${donation.id}: ${error.message}`,
      );
      throw error;
    }

    // 5. Return donation + checkout data
    return {
      donation_id: donation.id,
      streamer_name: streamer.nama_lengkap,
      jumlah: Number(donation.jumlah),
      status: donation.status,
      payment: invoice,
      message: 'Donasi berhasil divalidasi. Silakan lanjutkan ke pembayaran.',
    };
  }

  /**
   * Mengambil riwayat donasi untuk dashboard streamer.
   * Diurutkan berdasarkan tanggal terbaru.
   * 
   * Best Practice: Pagination menggunakan take/skip
   */
  async getMyDonations(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [donations, total] = await Promise.all([
      this.prisma.donation.findMany({
        where: { streamerId: userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
        select: {
          id: true,
          nama_donatur: true,
          email_donatur: true,
          pesan: true,
          jumlah: true,
          status: true,
          ai_status: true,
          ai_reason: true,
          payment_method: true,
          paid_at: true,
          createdAt: true,
        },
      }),
      this.prisma.donation.count({
        where: { streamerId: userId },
      }),
    ]);

    return {
      donations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Mengambil statistik donasi untuk dashboard streamer.
   */
  async getMyDonationStats(userId: string) {
    const [totalDonasi, totalPendapatan, totalDiblokir] = await Promise.all([
      this.prisma.donation.count({
        where: { streamerId: userId, status: 'SUCCESS' },
      }),
      this.prisma.donation.aggregate({
        where: { streamerId: userId, status: 'SUCCESS' },
        _sum: { jumlah: true },
      }),
      this.prisma.donation.count({
        where: { streamerId: userId, ai_status: 'BLOCKED' },
      }),
    ]);

    return {
      total_donasi_sukses: totalDonasi,
      total_pendapatan: totalPendapatan._sum.jumlah || 0,
      total_diblokir_ai: totalDiblokir,
    };
  }
}
