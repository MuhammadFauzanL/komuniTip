import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DonationGateway } from '../socket/donation.gateway';
import { UpdateOverlaySettingsDto } from './dto/update-overlay-settings.dto';

@Injectable()
export class OverlayService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly donationGateway: DonationGateway,
  ) {}

  async getMyOverlaySettings(userId: string) {
    return this.prisma.overlaySetting.upsert({
      where: { streamerId: userId },
      update: {},
      create: { streamerId: userId },
    });
  }

  async updateMyOverlaySettings(userId: string, dto: UpdateOverlaySettingsDto) {
    return this.prisma.overlaySetting.upsert({
      where: { streamerId: userId },
      update: {
        ...dto,
      },
      create: {
        streamerId: userId,
        ...dto,
      },
    });
  }

  async getPublicOverlaySettings(username: string) {
    const streamer = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        nama_lengkap: true,
        overlay: true,
      },
    });

    if (!streamer) {
      throw new NotFoundException('Kreator tidak ditemukan');
    }

    const settings =
      streamer.overlay ??
      (await this.prisma.overlaySetting.create({
        data: { streamerId: streamer.id },
      }));

    return {
      username: streamer.username,
      nama_lengkap: streamer.nama_lengkap,
      settings,
    };
  }

  async emitTestAlert(userId: string) {
    const streamer = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        username: true,
        nama_lengkap: true,
      },
    });

    if (!streamer?.username) {
      throw new NotFoundException('Username kreator belum tersedia');
    }

    const settings = await this.prisma.overlaySetting.upsert({
      where: { streamerId: userId },
      update: {},
      create: { streamerId: userId },
    });
    const soundThreshold = Number(
      (settings as { sound_min_donasi?: unknown }).sound_min_donasi ?? 200000,
    );

    const testAmount = Math.max(
      Number(settings.min_donasi_alert),
      soundThreshold,
      250000,
    );

    const payload = {
      donation_id: `test-${Date.now()}`,
      nama_donatur: 'KomuniTip Test',
      jumlah: testAmount,
      pesan: `Tes overlay untuk ${streamer.nama_lengkap}`,
    };

    this.donationGateway.emitDonationAlert(streamer.username, payload);

    return {
      emitted: true,
      room: streamer.username,
      payload,
    };
  }
}
