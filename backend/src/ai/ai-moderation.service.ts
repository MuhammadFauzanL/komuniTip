import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ModerationResult {
  safe: boolean;
  reason?: string;
}

type KeywordRule = {
  reasonPrefix: string;
  keywords: string[];
};

@Injectable()
export class AiModerationService {
  private readonly logger = new Logger(AiModerationService.name);
  private readonly keywordRules: KeywordRule[] = [
    {
      reasonPrefix: 'Terdeteksi promosi judi/spam',
      keywords: [
        'gacor',
        'maxwin',
        'scatter',
        'slot',
        'jackpot',
        'judol',
        'togel',
        'sportsbook',
        'sportbook',
        'casino',
        'poker',
        'roulette',
        'baccarat',
      ],
    },
    {
      reasonPrefix: 'Terdeteksi kata tidak pantas',
      keywords: [
        'anjing',
        'bangsat',
        'kontol',
        'memek',
        'babi',
        'tolol',
        'goblok',
        'bajingan',
        'keparat',
        'asu',
        'jancuk',
      ],
    },
  ];
  private readonly suspiciousUrlPattern =
    /\b(?:https?:\/\/|www\.|[a-z0-9-]+\.(?:xyz|site|top|click|bet|win|vip|fun|buzz|live|shop|online|icu|link))(?:[^\s]*)/i;

  private genAI: GoogleGenerativeAI;
  private model: any;
  private useAi: boolean;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.useAi = !!apiKey;

    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY not set. Using keyword-based filter as fallback.');
    }

    this.genAI = new GoogleGenerativeAI(apiKey || '');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  async moderateText(nama: string, pesan: string): Promise<ModerationResult> {
    if (this.useAi) {
      const aiResult = await this.moderateWithAi(nama, pesan);
      if (aiResult !== null) {
        return aiResult;
      }

      this.logger.warn('AI unavailable, falling back to keyword filter');
    }

    return this.moderateWithKeywords(nama, pesan);
  }

  private async moderateWithAi(
    nama: string,
    pesan: string,
  ): Promise<ModerationResult | null> {
    const textToCheck = `Nama: ${nama}\nPesan: ${pesan || ''}`;

    const prompt = `Kamu adalah sistem moderasi konten untuk platform donasi live streaming di Indonesia.

Tugasmu adalah menganalisis teks donasi berikut dan menentukan apakah teks tersebut AMAN atau BERBAHAYA.

Teks yang harus DIBLOKIR (BLOCKED):
1. Promosi judi online (judol) — contoh: "gacor", "maxwin", "slot", "scatter", link judi, nama situs judi
2. Kata-kata kasar/vulgar/SARA
3. Spam atau promosi produk/layanan
4. Link mencurigakan atau phishing
5. Konten seksual atau pornografi
6. Ancaman atau kekerasan
7. Variasi kata yang sengaja diubah untuk lolos filter (contoh: "g4c0r", "sl0t", "m@xwin")

Teks yang AMAN (SAFE):
1. Pesan dukungan biasa ("semangat", "keren", "lanjutkan")
2. Pertanyaan atau sapaan normal
3. Emoji dan ekspresi positif

Analisis teks berikut:
---
${textToCheck}
---

Berikan response HANYA dalam format JSON berikut (tanpa markdown, tanpa backticks):
{"safe": true} atau {"safe": false, "reason": "alasan singkat dalam bahasa Indonesia"}`;

    try {
      const result = (await Promise.race([
        this.model.generateContent(prompt),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AI moderation timeout')), 5000),
        ),
      ])) as any;

      const responseText = result.response.text().trim();
      this.logger.log(`AI Moderation response: ${responseText}`);

      const cleanJson = responseText
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/gi, '')
        .trim();

      const parsed = JSON.parse(cleanJson);

      return {
        safe: parsed.safe === true,
        reason: parsed.reason || undefined,
      };
    } catch (error) {
      this.logger.error(`AI Moderation error: ${error.message}`);
      return null;
    }
  }

  private moderateWithKeywords(nama: string, pesan: string): ModerationResult {
    const rawText = `${nama} ${pesan || ''}`.trim();
    const normalizedText = this.normalizeForMatching(rawText);
    const tokens = this.extractTokens(normalizedText);

    if (this.suspiciousUrlPattern.test(rawText)) {
      const reason = 'Terdeteksi tautan yang mencurigakan atau promosi eksternal';
      this.logger.warn(`Keyword filter BLOCKED: "${rawText}" → ${reason}`);
      return { safe: false, reason };
    }

    for (const rule of this.keywordRules) {
      const matchedKeyword = rule.keywords.find((keyword) =>
        this.matchesKeyword(keyword, normalizedText, tokens),
      );

      if (!matchedKeyword) {
        continue;
      }

      const reason = `${rule.reasonPrefix}: "${matchedKeyword}"`;
      this.logger.warn(`Keyword filter BLOCKED: "${rawText}" → ${reason}`);
      return { safe: false, reason };
    }

    this.logger.log(`Keyword filter PASSED: "${rawText}"`);
    return { safe: true };
  }

  private normalizeForMatching(value: string) {
    const leetspeakMap: Record<string, string> = {
      '0': 'o',
      '1': 'i',
      '3': 'e',
      '4': 'a',
      '5': 's',
      '7': 't',
      '@': 'a',
      '$': 's',
    };

    return value
      .toLowerCase()
      .split('')
      .map((character) => leetspeakMap[character] ?? character)
      .join('');
  }

  private extractTokens(value: string) {
    return value.match(/[a-z]+/g) ?? [];
  }

  private matchesKeyword(keyword: string, normalizedText: string, tokens: string[]) {
    if (tokens.includes(keyword)) {
      return true;
    }

    const compactText = normalizedText.replace(/[^a-z]/g, '');
    return compactText.includes(keyword);
  }
}
