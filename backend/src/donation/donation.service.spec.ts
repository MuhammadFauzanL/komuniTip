import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DonationService } from './donation.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiModerationService } from '../ai/ai-moderation.service';
import { PaymentService } from '../payment/payment.service';

describe('DonationService', () => {
  let service: DonationService;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
    },
    donation: {
      create: jest.fn(),
    },
  };

  const aiModerationMock = {
    moderateText: jest.fn(),
  };

  const paymentServiceMock = {
    createInvoice: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DonationService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: AiModerationService,
          useValue: aiModerationMock,
        },
        {
          provide: PaymentService,
          useValue: paymentServiceMock,
        },
      ],
    }).compile();

    service = module.get<DonationService>(DonationService);
  });

  it('creates a donation and returns checkout data when moderation passes', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'streamer-1',
      nama_lengkap: 'Streamer Satu',
    });
    aiModerationMock.moderateText.mockResolvedValue({ safe: true });
    prismaMock.donation.create.mockResolvedValue({
      id: 'donation-1',
      jumlah: 25000,
      status: 'PENDING',
    });
    paymentServiceMock.createInvoice.mockResolvedValue({
      donation_id: 'donation-1',
      invoice_url: 'https://pay.test/invoice',
      invoice_id: 'inv-1',
      external_id: 'komunitip_donation-1',
      amount: 25000,
      expiry_date: '2026-05-01T10:00:00.000Z',
    });

    const result = await service.createDonation('streamer-satu', {
      nama_donatur: 'Budi',
      email_donatur: 'budi@example.com',
      pesan: 'Semangat terus',
      jumlah: 25000,
    });

    expect(paymentServiceMock.createInvoice).toHaveBeenCalledWith('donation-1');
    expect(result).toEqual({
      donation_id: 'donation-1',
      streamer_name: 'Streamer Satu',
      jumlah: 25000,
      status: 'PENDING',
      payment: {
        donation_id: 'donation-1',
        invoice_url: 'https://pay.test/invoice',
        invoice_id: 'inv-1',
        external_id: 'komunitip_donation-1',
        amount: 25000,
        expiry_date: '2026-05-01T10:00:00.000Z',
      },
      message: 'Donasi berhasil divalidasi. Silakan lanjutkan ke pembayaran.',
    });
  });

  it('stores blocked donations and throws a friendly error', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'streamer-1',
      nama_lengkap: 'Streamer Satu',
    });
    aiModerationMock.moderateText.mockResolvedValue({
      safe: false,
      reason: 'Terdeteksi kata terlarang: "slot"',
    });

    await expect(
      service.createDonation('streamer-satu', {
        nama_donatur: 'Budi',
        email_donatur: 'budi@example.com',
        pesan: 'slot gacor',
        jumlah: 25000,
      }),
    ).rejects.toThrow(BadRequestException);

    expect(prismaMock.donation.create).toHaveBeenCalledWith({
      data: {
        streamerId: 'streamer-1',
        nama_donatur: 'Budi',
        email_donatur: 'budi@example.com',
        pesan: 'slot gacor',
        jumlah: 25000,
        status: 'BLOCKED',
        ai_status: 'BLOCKED',
        ai_reason: 'Terdeteksi kata terlarang: "slot"',
      },
    });
    expect(paymentServiceMock.createInvoice).not.toHaveBeenCalled();
  });

  it('throws not found when streamer username does not exist', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      service.createDonation('unknown-user', {
        nama_donatur: 'Budi',
        pesan: 'Semangat',
        jumlah: 25000,
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
