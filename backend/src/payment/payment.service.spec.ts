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
    },
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
      ai_status: 'SAFE',
      ai_reason: null,
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
      ai_status: 'SAFE',
      ai_reason: null,
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
});
