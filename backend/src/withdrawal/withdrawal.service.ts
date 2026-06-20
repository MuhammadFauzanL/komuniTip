import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { Prisma, WithdrawalStatus } from '@prisma/client';

const MINIMUM_WITHDRAWAL_AMOUNT = 50000;

@Injectable()
export class WithdrawalService {
  constructor(private readonly prisma: PrismaService) {}

  async createWithdrawal(userId: string, dto: CreateWithdrawalDto) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          saldo_aktif: true,
          saldo_tertahan: true,
        },
      });

      if (!user) {
        throw new NotFoundException('User tidak ditemukan');
      }

      const requestedAmount = this.toCurrencyNumber(dto.amount);
      const availableBalance = Number(user.saldo_aktif);

      if (requestedAmount < MINIMUM_WITHDRAWAL_AMOUNT) {
        throw new BadRequestException(
          `Minimum withdraw adalah Rp${MINIMUM_WITHDRAWAL_AMOUNT.toLocaleString('id-ID')}`,
        );
      }

      if (availableBalance < requestedAmount) {
        throw new BadRequestException('Saldo aktif tidak mencukupi untuk withdraw');
      }

      const withdrawal = await tx.withdrawal.create({
        data: {
          streamerId: userId,
          amount: new Prisma.Decimal(requestedAmount),
          bank_name: dto.bank_name,
          account_name: dto.account_name,
          account_number: dto.account_number,
          notes: dto.notes || null,
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          saldo_aktif: { decrement: requestedAmount },
          saldo_tertahan: { increment: requestedAmount },
        },
        select: {
          saldo_aktif: true,
          saldo_tertahan: true,
        },
      });

      return {
        balance: this.toBalanceSummary(updatedUser),
        withdrawal: this.toWithdrawalItem(withdrawal),
      };
    });
  }

  async getMyWithdrawals(userId: string) {
    const [user, withdrawals] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          saldo_aktif: true,
          saldo_tertahan: true,
        },
      }),
      this.prisma.withdrawal.findMany({
        where: { streamerId: userId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    return {
      balance: this.toBalanceSummary(user),
      withdrawals: withdrawals.map((withdrawal) => this.toWithdrawalItem(withdrawal)),
    };
  }

  async cancelMyWithdrawal(userId: string, withdrawalId: string) {
    return this.prisma.$transaction(async (tx) => {
      const withdrawal = await tx.withdrawal.findFirst({
        where: {
          id: withdrawalId,
          streamerId: userId,
        },
      });

      if (!withdrawal) {
        throw new NotFoundException('Request withdraw tidak ditemukan');
      }

      if (withdrawal.status !== WithdrawalStatus.PENDING) {
        throw new BadRequestException('Hanya withdraw berstatus pending yang bisa dibatalkan');
      }

      const amount = Number(withdrawal.amount);

      const updatedWithdrawal = await tx.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: WithdrawalStatus.CANCELLED,
          cancelled_at: new Date(),
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          saldo_aktif: { increment: amount },
          saldo_tertahan: { decrement: amount },
        },
        select: {
          saldo_aktif: true,
          saldo_tertahan: true,
        },
      });

      return {
        balance: this.toBalanceSummary(updatedUser),
        withdrawal: this.toWithdrawalItem(updatedWithdrawal),
      };
    });
  }

  private toBalanceSummary(user: {
    saldo_aktif: Prisma.Decimal | number;
    saldo_tertahan: Prisma.Decimal | number;
  }) {
    return {
      saldo_aktif: Number(user.saldo_aktif),
      saldo_tertahan: Number(user.saldo_tertahan),
    };
  }

  private toWithdrawalItem(withdrawal: {
    id: string;
    amount: Prisma.Decimal | number;
    bank_name: string;
    account_name: string;
    account_number: string;
    notes: string | null;
    status: WithdrawalStatus;
    processed_at: Date | null;
    cancelled_at: Date | null;
    failure_reason: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: withdrawal.id,
      amount: Number(withdrawal.amount),
      bank_name: withdrawal.bank_name,
      account_name: withdrawal.account_name,
      account_number: withdrawal.account_number,
      notes: withdrawal.notes,
      status: withdrawal.status,
      processed_at: withdrawal.processed_at,
      cancelled_at: withdrawal.cancelled_at,
      failure_reason: withdrawal.failure_reason,
      createdAt: withdrawal.createdAt,
      updatedAt: withdrawal.updatedAt,
    };
  }

  private toCurrencyNumber(value: number) {
    return Number(value.toFixed(2));
  }
}
