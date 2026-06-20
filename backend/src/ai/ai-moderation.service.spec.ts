import { ConfigService } from '@nestjs/config';
import { AiModerationService } from './ai-moderation.service';

describe('AiModerationService', () => {
  let service: AiModerationService;

  beforeEach(() => {
    const configService = {
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ConfigService;

    service = new AiModerationService(configService);
  });

  it('blocks gambling keywords in fallback mode', async () => {
    await expect(service.moderateText('Budi', 'slot gacor maxwin')).resolves.toEqual({
      safe: false,
      reason: 'Terdeteksi promosi judi/spam: "gacor"',
    });
  });

  it('blocks leetspeak variants in fallback mode', async () => {
    await expect(service.moderateText('Budi', 'sl0t g4c0r')).resolves.toEqual({
      safe: false,
      reason: 'Terdeteksi promosi judi/spam: "gacor"',
    });
  });

  it('blocks suspicious external links in fallback mode', async () => {
    await expect(
      service.moderateText('Budi', 'cek promo di https://bonus-spin.xyz'),
    ).resolves.toEqual({
      safe: false,
      reason: 'Terdeteksi tautan yang mencurigakan atau promosi eksternal',
    });
  });

  it('does not block normal words that only contain similar substrings', async () => {
    await expect(service.moderateText('Budi', 'aku cukup senang hari ini')).resolves.toEqual({
      safe: true,
    });
  });

  it('passes normal encouragement messages', async () => {
    await expect(
      service.moderateText('Budi', 'semangat terus bang, kontennya keren'),
    ).resolves.toEqual({
      safe: true,
    });
  });
});
