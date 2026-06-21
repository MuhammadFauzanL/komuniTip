import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type AiDecision = 'CLEAR' | 'HOLD' | 'BLOCK';

export interface ModerationResult {
  donation_id: string;
  decision: AiDecision;
  risk_score: number;
  matched_keywords: string[];
  ai_confidence?: number;
  execution_path: string;
  reason?: string;
}

type EvaluationPayload = {
  donation_id: string;
  raw_text: string;
  amount?: number;
  is_round_amount?: boolean;
  donor_messages_last_10min?: number;
};

type EvaluationResponse = {
  donation_id: string;
  decision: AiDecision;
  risk_score: number;
  matched_keywords: string[];
  ai_confidence?: number;
  execution_path: string;
};

@Injectable()
export class AiModerationService {
  private readonly logger = new Logger(AiModerationService.name);

  constructor(private readonly configService: ConfigService) {
    const serviceUrl = this.configService.get<string>('AI_MODERATION_URL');
    const apiKey = this.configService.get<string>('AI_MODERATION_API_KEY');

    if (!serviceUrl || !apiKey) {
      throw new Error(
        'AI moderation configuration is incomplete. Set AI_MODERATION_URL and AI_MODERATION_API_KEY.',
      );
    }
  }

  async moderateDonation(payload: EvaluationPayload): Promise<ModerationResult> {
    const response = await this.evaluateWithRiskEngine(payload);
    return {
      ...response,
      reason: this.buildReason(response.decision, response.matched_keywords),
    };
  }

  async checkHealth(): Promise<{ status: string; ai_loaded: boolean }> {
    const response = await this.fetchWithTimeout(this.buildUrl('/'), {
      method: 'GET',
    });

    if (!response.ok) {
      throw new ServiceUnavailableException('AI moderation health check failed.');
    }

    return (await response.json()) as { status: string; ai_loaded: boolean };
  }

  private async evaluateWithRiskEngine(
    payload: EvaluationPayload,
  ): Promise<EvaluationResponse> {
    try {
      const response = await this.fetchWithTimeout(this.buildUrl('/v1/evaluate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.getApiKey(),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const responseBody = await response.text();
        throw new Error(`AI service returned ${response.status}: ${responseBody}`);
      }

      const result = (await response.json()) as EvaluationResponse;
      this.logger.log(
        `AI moderation decision=${result.decision} risk=${result.risk_score} path=${result.execution_path} donation=${result.donation_id}`,
      );
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown AI moderation error';
      this.logger.error(`AI moderation request failed: ${message}`);
      throw new ServiceUnavailableException('AI moderation service is unavailable.');
    }
  }

  private async fetchWithTimeout(url: string, init: RequestInit) {
    const timeoutMs = this.getTimeoutMs();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await fetch(url, {
        ...init,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildUrl(path: string) {
    return new URL(path, this.getServiceUrl()).toString();
  }

  private getServiceUrl() {
    return this.configService.getOrThrow<string>('AI_MODERATION_URL');
  }

  private getApiKey() {
    return this.configService.getOrThrow<string>('AI_MODERATION_API_KEY');
  }

  private getTimeoutMs() {
    return Number(this.configService.get<string>('AI_MODERATION_TIMEOUT_MS') ?? '2000');
  }

  private buildReason(decision: AiDecision, matchedKeywords: string[]) {
    if (decision === 'CLEAR') {
      return undefined;
    }

    if (matchedKeywords.length > 0) {
      return `Terdeteksi indikator berisiko: ${matchedKeywords.join(', ')}`;
    }

    if (decision === 'HOLD') {
      return 'Pesan ditahan untuk review manual karena skor risiko mencurigakan.';
    }

    return 'Pesan diblokir oleh AI moderation.';
  }
}
