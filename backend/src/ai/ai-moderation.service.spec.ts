import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiModerationService } from './ai-moderation.service';

describe('AiModerationService', () => {
  let service: AiModerationService;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    const configService = {
      get: jest.fn((key: string) => {
        const values: Record<string, string> = {
          AI_MODERATION_URL: 'http://risk-engine:8000',
          AI_MODERATION_API_KEY: 'secret-key',
          AI_MODERATION_TIMEOUT_MS: '2000',
        };

        return values[key];
      }),
      getOrThrow: jest.fn((key: string) => {
        const values: Record<string, string> = {
          AI_MODERATION_URL: 'http://risk-engine:8000',
          AI_MODERATION_API_KEY: 'secret-key',
        };

        return values[key];
      }),
    } as unknown as ConfigService;

    service = new AiModerationService(configService);
  });

  it('maps a CLEAR response from the risk engine', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        donation_id: 'donation-1',
        decision: 'CLEAR',
        risk_score: 4,
        matched_keywords: [],
        execution_path: 'Layer-0-Only',
      }),
    });

    await expect(
      service.moderateDonation({
        donation_id: 'donation-1',
        raw_text: 'semangat terus bang',
        amount: 10000,
      }),
    ).resolves.toEqual({
      donation_id: 'donation-1',
      decision: 'CLEAR',
      risk_score: 4,
      matched_keywords: [],
      execution_path: 'Layer-0-Only',
      reason: undefined,
    });
  });

  it('adds a readable reason for HOLD responses', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        donation_id: 'donation-2',
        decision: 'HOLD',
        risk_score: 47,
        matched_keywords: ['brand_pluto88'],
        ai_confidence: 0.71,
        execution_path: 'Layer-1-AI',
      }),
    });

    await expect(
      service.moderateDonation({
        donation_id: 'donation-2',
        raw_text: 'mampir pluto88',
      }),
    ).resolves.toEqual({
      donation_id: 'donation-2',
      decision: 'HOLD',
      risk_score: 47,
      matched_keywords: ['brand_pluto88'],
      ai_confidence: 0.71,
      execution_path: 'Layer-1-AI',
      reason: 'Terdeteksi indikator berisiko: brand_pluto88',
    });
  });

  it('throws ServiceUnavailableException when the risk engine fails', async () => {
    fetchMock.mockRejectedValue(new Error('connect ECONNREFUSED'));

    await expect(
      service.moderateDonation({
        donation_id: 'donation-3',
        raw_text: 'halo',
      }),
    ).rejects.toThrow(ServiceUnavailableException);
  });
});
