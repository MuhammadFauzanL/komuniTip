import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

@Injectable()
export class LoginAttemptService {
  constructor(private readonly prisma: PrismaService) {}

  async assertNotLocked(rawIdentifier: string, clientIp: string) {
    const { identifier, normalizedClientIp } = this.normalizeKey(rawIdentifier, clientIp);
    const record = await this.prisma.loginAttempt.findUnique({
      where: {
        identifier_client_ip: {
          identifier,
          client_ip: normalizedClientIp,
        },
      },
    });

    if (!record?.locked_until) {
      return;
    }

    if (record.locked_until <= new Date()) {
      await this.prisma.loginAttempt.delete({
        where: {
          identifier_client_ip: {
            identifier,
            client_ip: normalizedClientIp,
          },
        },
      });
      return;
    }

    const retryAfterSeconds = Math.ceil(
      (record.locked_until.getTime() - Date.now()) / 1000,
    );
    throw new HttpException(
      `Terlalu banyak percobaan login gagal. Coba lagi dalam ${retryAfterSeconds} detik.`,
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }

  async recordFailure(rawIdentifier: string, clientIp: string) {
    const { identifier, normalizedClientIp } = this.normalizeKey(rawIdentifier, clientIp);
    const current = await this.prisma.loginAttempt.findUnique({
      where: {
        identifier_client_ip: {
          identifier,
          client_ip: normalizedClientIp,
        },
      },
    });

    const failedAttempts = (current?.failed_attempts ?? 0) + 1;
    const lockedUntil =
      failedAttempts >= MAX_FAILED_ATTEMPTS
        ? new Date(Date.now() + LOCKOUT_DURATION_MS)
        : null;

    await this.prisma.loginAttempt.upsert({
      where: {
        identifier_client_ip: {
          identifier,
          client_ip: normalizedClientIp,
        },
      },
      create: {
        identifier,
        client_ip: normalizedClientIp,
        failed_attempts: failedAttempts,
        locked_until: lockedUntil,
        last_attempt_at: new Date(),
      },
      update: {
        failed_attempts: failedAttempts,
        locked_until: lockedUntil,
        last_attempt_at: new Date(),
      },
    });
  }

  async reset(rawIdentifier: string, clientIp: string) {
    const { identifier, normalizedClientIp } = this.normalizeKey(rawIdentifier, clientIp);
    await this.prisma.loginAttempt.deleteMany({
      where: {
        identifier,
        client_ip: normalizedClientIp,
      },
    });
  }

  async getSnapshot(rawIdentifier: string, clientIp: string) {
    const { identifier, normalizedClientIp } = this.normalizeKey(rawIdentifier, clientIp);
    return this.prisma.loginAttempt.findUnique({
      where: {
        identifier_client_ip: {
          identifier,
          client_ip: normalizedClientIp,
        },
      },
    });
  }

  private normalizeKey(rawIdentifier: string, clientIp: string) {
    return {
      identifier: this.normalizeIdentifier(rawIdentifier),
      normalizedClientIp: clientIp.trim(),
    };
  }

  private normalizeIdentifier(rawIdentifier: string) {
    return rawIdentifier.trim().toLowerCase();
  }
}
