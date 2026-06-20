import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { OverlayService } from './overlay.service';
import { PrismaService } from '../prisma/prisma.service';
import { DonationGateway } from '../socket/donation.gateway';

describe('OverlayService', () => {
  let service: OverlayService;

  const prismaMock = {
    overlaySetting: {
      upsert: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  const donationGatewayMock = {
    emitDonationAlert: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OverlayService,
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

    service = module.get<OverlayService>(OverlayService);
  });

  it('returns default settings through upsert for the authenticated streamer', async () => {
    prismaMock.overlaySetting.upsert.mockResolvedValue({
      streamerId: 'user-1',
      min_donasi_alert: 10000,
      durasi_alert: 8,
      sound_min_donasi: 200000,
    });

    const result = await service.getMyOverlaySettings('user-1');

    expect(prismaMock.overlaySetting.upsert).toHaveBeenCalledWith({
      where: { streamerId: 'user-1' },
      update: {},
      create: { streamerId: 'user-1' },
    });
    expect(result.streamerId).toBe('user-1');
  });

  it('emits a test alert to the streamer room', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      username: 'rhrdiannz',
      nama_lengkap: 'Rhrdiannz',
    });
    prismaMock.overlaySetting.upsert.mockResolvedValue({
      min_donasi_alert: 10000,
      sound_min_donasi: 200000,
    });

    const result = await service.emitTestAlert('user-1');

    expect(donationGatewayMock.emitDonationAlert).toHaveBeenCalledWith(
      'rhrdiannz',
      expect.objectContaining({
        nama_donatur: 'KomuniTip Test',
        jumlah: 250000,
      }),
    );
    expect(result.emitted).toBe(true);
  });

  it('throws when a streamer has no username for overlay room', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ username: null, nama_lengkap: 'No Username' });

    await expect(service.emitTestAlert('user-1')).rejects.toThrow(NotFoundException);
  });
});
