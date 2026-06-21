import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { DonationService } from './donation.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiModerationService } from '../ai/ai-moderation.service';
import { PaymentService } from '../payment/payment.service';

jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'donation-seeded-id'),
}));

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
    moderateDonation: jest.fn(),
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

  it('creates a donation and returns checkout data when moderation clears the message', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'streamer-1',
      nama_lengkap: 'Streamer Satu',
    });
    aiModerationMock.moderateDonation.mockResolvedValue({
      donation_id: 'risk-1',
      decision: 'CLEAR',
      risk_score: 7,
      matched_keywords: [],
      execution_path: 'Layer-0-Only',
    });
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
    expect(prismaMock.donation.create).toHaveBeenCalledWith({
      data: {
        id: 'donation-seeded-id',
        streamerId: 'streamer-1',
        nama_donatur: 'Budi',
        email_donatur: 'budi@example.com',
        pesan: 'Semangat terus',
        jumlah: 25000,
        status: 'PENDING',
        ai_status: 'CLEAR',
        ai_reason: null,
        ai_risk_score: 7,
        ai_confidence: undefined,
        ai_execution_path: 'Layer-0-Only',
        ai_matched_keywords: [],
      },
    });
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
    aiModerationMock.moderateDonation.mockResolvedValue({
      donation_id: 'risk-2',
      decision: 'BLOCK',
      risk_score: 96,
      matched_keywords: ['slot'],
      execution_path: 'Layer-1-AI',
      reason: 'Terdeteksi indikator berisiko: slot',
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
        id: 'donation-seeded-id',
        streamerId: 'streamer-1',
        nama_donatur: 'Budi',
        email_donatur: 'budi@example.com',
        pesan: 'slot gacor',
        jumlah: 25000,
        status: 'BLOCKED',
        ai_status: 'BLOCK',
        ai_reason: 'Terdeteksi indikator berisiko: slot',
        ai_risk_score: 96,
        ai_confidence: undefined,
        ai_execution_path: 'Layer-1-AI',
        ai_matched_keywords: ['slot'],
      },
    });
    expect(paymentServiceMock.createInvoice).not.toHaveBeenCalled();
  });

  it('stores held donations when the risk engine returns HOLD', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'streamer-1',
      nama_lengkap: 'Streamer Satu',
    });
    aiModerationMock.moderateDonation.mockResolvedValue({
      donation_id: 'risk-3',
      decision: 'HOLD',
      risk_score: 51,
      matched_keywords: ['brand_pluto88'],
      execution_path: 'Layer-1-AI',
      reason: 'Terdeteksi indikator berisiko: brand_pluto88',
    });
    prismaMock.donation.create.mockResolvedValue({
      id: 'donation-held-1',
    });

    await expect(
      service.createDonation('streamer-satu', {
        nama_donatur: 'Budi',
        email_donatur: 'budi@example.com',
        pesan: 'mampir pluto88',
        jumlah: 25000,
      }),
    ).rejects.toThrow(BadRequestException);

    expect(prismaMock.donation.create).toHaveBeenCalledWith({
      data: {
        id: 'donation-seeded-id',
        streamerId: 'streamer-1',
        nama_donatur: 'Budi',
        email_donatur: 'budi@example.com',
        pesan: 'mampir pluto88',
        jumlah: 25000,
        status: 'HOLD',
        ai_status: 'HOLD',
        ai_reason: 'Terdeteksi indikator berisiko: brand_pluto88',
        ai_risk_score: 51,
        ai_confidence: undefined,
        ai_execution_path: 'Layer-1-AI',
        ai_matched_keywords: ['brand_pluto88'],
      },
    });
  });

  it('fails closed when the risk engine is unavailable', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'streamer-1',
      nama_lengkap: 'Streamer Satu',
    });
    prismaMock.donation.create.mockResolvedValue({
      id: 'donation-held-2',
    });
    aiModerationMock.moderateDonation.mockRejectedValue(
      new ServiceUnavailableException('AI moderation service is unavailable.'),
    );

    await expect(
      service.createDonation('streamer-satu', {
        nama_donatur: 'Budi',
        email_donatur: 'budi@example.com',
        pesan: 'semangat bang',
        jumlah: 25000,
      }),
    ).rejects.toThrow(ServiceUnavailableException);

    expect(prismaMock.donation.create).toHaveBeenCalledWith({
      data: {
        id: 'donation-seeded-id',
        streamerId: 'streamer-1',
        nama_donatur: 'Budi',
        email_donatur: 'budi@example.com',
        pesan: 'semangat bang',
        jumlah: 25000,
        status: 'HOLD',
        ai_status: 'HOLD',
        ai_reason: 'AI moderation service unavailable. Donation held for manual review.',
      },
    });
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
