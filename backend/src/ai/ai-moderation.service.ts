import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ModerationResult {
  safe: boolean;
  reason?: string;
}

@Injectable()
export class AiModerationService {
  private readonly logger = new Logger(AiModerationService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;
  private useAi: boolean;

  // Keyword blacklist sebagai fallback jika Gemini API tidak tersedia
  private readonly BLOCKED_KEYWORDS = [
    // Judi online
    'gacor', 'maxwin', 'scatter', 'slot', 'jackpot', 'judol', 'togel',
    'sportbook', 'casino', 'poker', 'roulette', 'baccarat',
    'g4c0r', 'sl0t', 'm@xwin', 'j4ckpot',
    // Kata kasar
    'anjing', 'bangsat', 'kontol', 'memek', 'babi', 'tolol', 'goblok',
    'bajingan', 'keparat', 'asu', 'jancuk', 'cuk',
    // Spam patterns
    '.com', '.net', '.xyz', '.site', 'http://', 'https://', 'www.',
  ];

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.useAi = !!apiKey;

    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY not set. Using keyword-based filter as fallback.');
    }

    this.genAI = new GoogleGenerativeAI(apiKey || '');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  /**
   * Moderasi teks donasi menggunakan dual-mode:
   * 1. PRIMARY: Google Gemini AI (jika API key tersedia & quota OK)
   * 2. FALLBACK: Keyword-based filter (jika AI error/quota habis)
   * 
   * Best Practice:
   * - Timeout 5 detik untuk AI
   * - Fallback ke keyword filter, BUKAN fallback ke SAFE
   * - Log semua hasil untuk audit trail
   */
  async moderateText(nama: string, pesan: string): Promise<ModerationResult> {
    // Coba AI dulu, jika gagal fallback ke keyword filter
    if (this.useAi) {
      const aiResult = await this.moderateWithAi(nama, pesan);
      if (aiResult !== null) {
        return aiResult;
      }
      // AI gagal → fallback ke keyword
      this.logger.warn('AI unavailable, falling back to keyword filter');
    }

    return this.moderateWithKeywords(nama, pesan);
  }

  /**
   * Moderasi menggunakan Google Gemini AI.
   * Return null jika API error (agar bisa fallback).
   */
  private async moderateWithAi(nama: string, pesan: string): Promise<ModerationResult | null> {
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
      const result = await Promise.race([
        this.model.generateContent(prompt),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AI moderation timeout')), 5000),
        ),
      ]) as any;

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
      return null; // Return null agar fallback ke keyword filter
    }
  }

  /**
   * Moderasi menggunakan keyword blacklist.
   * Digunakan sebagai fallback jika Gemini API tidak tersedia.
   */
  private moderateWithKeywords(nama: string, pesan: string): ModerationResult {
    const combinedText = `${nama} ${pesan || ''}`.toLowerCase();

    for (const keyword of this.BLOCKED_KEYWORDS) {
      if (combinedText.includes(keyword.toLowerCase())) {
        const reason = `Terdeteksi kata terlarang: "${keyword}"`;
        this.logger.warn(`Keyword filter BLOCKED: "${combinedText}" → ${reason}`);
        return { safe: false, reason };
      }
    }

    this.logger.log(`Keyword filter PASSED: "${combinedText}"`);
    return { safe: true };
  }
}
