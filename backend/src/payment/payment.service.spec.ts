import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentService } from './payment.service';
import { PrismaService } from '../prisma/prisma.service';
import { DonationGateway } from '../socket/donation.gateway';

describe('PaymentService', () => {
  let service: PaymentService;

  const prismaMock = {
    donation: {
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const configServiceMock = {
    get: jest.fn((key: string) => {
      const values: Record<string, string> = {
        XENDIT_SECRET_KEY: 'xnd_test_key',
        FRONTEND_URL: 'http://localhost:5173',
      };

      return values[key];
    }),
  };

  const donationGatewayMock = {
    emitDonationAlert: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: DonationGateway,
          useValue: donationGatewayMock,
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  it('returns normalized donation status data for audit checks', async () => {
    prismaMock.donation.findUnique.mockResolvedValue({
      id: 'donation-1',
      status: 'SUCCESS',
      jumlah: 50000,
      nama_donatur: 'Budi',
      pesan: 'Semangat terus',
      payment_method: 'QRIS',
      paid_at: new Date('2026-05-01T10:00:00.000Z'),
      payment_gateway_ref: 'komunitip_donation-1',
      ai_status: 'CLEAR',
      ai_reason: null,
      ai_risk_score: 7,
      ai_confidence: 0.92,
      ai_execution_path: 'Layer-1-AI',
      ai_matched_keywords: [],
      createdAt: new Date('2026-05-01T09:55:00.000Z'),
      streamer: {
        username: 'streamer-satu',
        nama_lengkap: 'Streamer Satu',
      },
    });

    const result = await service.getDonationStatus('donation-1');

    expect(result).toEqual({
      donation_id: 'donation-1',
      status: 'SUCCESS',
      amount: 50000,
      donor_name: 'Budi',
      message: 'Semangat terus',
      payment_method: 'QRIS',
      paid_at: new Date('2026-05-01T10:00:00.000Z'),
      payment_reference: 'komunitip_donation-1',
      ai_status: 'CLEAR',
      ai_reason: null,
      ai_risk_score: 7,
      ai_confidence: 0.92,
      ai_execution_path: 'Layer-1-AI',
      ai_matched_keywords: [],
      created_at: new Date('2026-05-01T09:55:00.000Z'),
      streamer: {
        username: 'streamer-satu',
        nama_lengkap: 'Streamer Satu',
      },
    });
  });

  it('throws when donation status is requested for an unknown donation id', async () => {
    prismaMock.donation.findUnique.mockResolvedValue(null);

    await expect(service.getDonationStatus('missing')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('marks payment as mismatch when paid amount differs from expected amount', async () => {
    configServiceMock.get = jest.fn((key: string) => {
      const values: Record<string, string> = {
        XENDIT_SECRET_KEY: 'xnd_test_key',
        FRONTEND_URL: 'http://localhost:5173',
        XENDIT_WEBHOOK_TOKEN: 'webhook-token',
      };

      return values[key];
    });

    prismaMock.donation.findUnique.mockResolvedValue({
      id: 'donation-1',
      jumlah: 50000,
      status: 'PENDING',
      nama_donatur: 'Budi',
      pesan: 'Semangat',
      streamerId: 'streamer-1',
      streamer: { username: 'streamer-satu' },
    });

    const result = await service.handleWebhook('webhook-token', {
      external_id: 'komunitip_donation-1',
      status: 'PAID',
      payment_method: 'QRIS',
      paid_amount: 45000,
    });

    expect(prismaMock.donation.update).toHaveBeenCalledWith({
      where: { id: 'donation-1' },
      data: {
        status: 'FAILED',
        payment_method: 'QRIS',
      },
    });
    expect(result).toEqual({
      status: 'PAYMENT_MISMATCH',
      donation_id: 'donation-1',
    });
    expect(donationGatewayMock.emitDonationAlert).not.toHaveBeenCalled();
  });

  it('credits saldo and emits overlay payload when payment succeeds', async () => {
    configServiceMock.get = jest.fn((key: string) => {
      const values: Record<string, string> = {
        XENDIT_SECRET_KEY: 'xnd_test_key',
        FRONTEND_URL: 'http://localhost:5173',
        XENDIT_WEBHOOK_TOKEN: 'webhook-token',
      };

      return values[key];
    });

    prismaMock.donation.findUnique.mockResolvedValue({
      id: 'donation-1',
      jumlah: 50000,
      status: 'PENDING',
      nama_donatur: 'Budi',
      pesan: 'Semangat',
      streamerId: 'streamer-1',
      streamer: { username: 'streamer-satu' },
    });
    prismaMock.donation.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.user.update.mockResolvedValue({});
    prismaMock.$transaction.mockImplementation(async (callback: any) =>
      callback({
        donation: prismaMock.donation,
        user: prismaMock.user,
      }),
    );

    const result = await service.handleWebhook('webhook-token', {
      external_id: 'komunitip_donation-1',
      status: 'PAID',
      payment_method: 'QRIS',
      paid_amount: 50000,
    });

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'streamer-1' },
      data: {
        saldo_aktif: { increment: 50000 },
      },
    });
    expect(donationGatewayMock.emitDonationAlert).toHaveBeenCalledWith(
      'streamer-satu',
      expect.objectContaining({
        donation_id: 'donation-1',
        nama_donatur: 'Budi',
        jumlah: 50000,
        pesan: 'Semangat',
        source: 'payment',
      }),
    );
    expect(result).toEqual({
      status: 'SUCCESS',
      donation_id: 'donation-1',
    });
  });
});
