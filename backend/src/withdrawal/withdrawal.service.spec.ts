import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { WithdrawalService } from './withdrawal.service';

describe('WithdrawalService', () => {
  let service: WithdrawalService;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    withdrawal: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WithdrawalService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<WithdrawalService>(WithdrawalService);
  });

  it('creates a pending withdrawal and moves balance to saldo_tertahan', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      saldo_aktif: 100000,
      saldo_tertahan: 0,
    });
    prismaMock.withdrawal.create.mockResolvedValue({
      id: 'withdrawal-1',
      amount: 50000,
      bank_name: 'BCA',
      account_name: 'Budi Santoso',
      account_number: '1234567890',
      notes: 'Pencairan awal bulan',
      status: 'PENDING',
      processed_at: null,
      cancelled_at: null,
      failure_reason: null,
      createdAt: new Date('2026-05-04T10:00:00.000Z'),
      updatedAt: new Date('2026-05-04T10:00:00.000Z'),
    });
    prismaMock.user.update.mockResolvedValue({
      saldo_aktif: 50000,
      saldo_tertahan: 50000,
    });
    prismaMock.$transaction.mockImplementation((callback: (tx: typeof prismaMock) => unknown) =>
      callback(prismaMock),
    );

    const result = await service.createWithdrawal('user-1', {
      amount: 50000,
      bank_name: 'BCA',
      account_name: 'Budi Santoso',
      account_number: '1234567890',
      notes: 'Pencairan awal bulan',
    });

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        saldo_aktif: { decrement: 50000 },
        saldo_tertahan: { increment: 50000 },
      },
      select: {
        saldo_aktif: true,
        saldo_tertahan: true,
      },
    });
    expect(result).toEqual({
      balance: {
        saldo_aktif: 50000,
        saldo_tertahan: 50000,
      },
      withdrawal: expect.objectContaining({
        id: 'withdrawal-1',
        amount: 50000,
        status: 'PENDING',
      }),
    });
  });

  it('rejects withdrawal when saldo aktif is insufficient', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      saldo_aktif: 30000,
      saldo_tertahan: 0,
    });
    prismaMock.$transaction.mockImplementation((callback: (tx: typeof prismaMock) => unknown) =>
      callback(prismaMock),
    );

    await expect(
      service.createWithdrawal('user-1', {
        amount: 50000,
        bank_name: 'BCA',
        account_name: 'Budi Santoso',
        account_number: '1234567890',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('returns balance summary with newest withdrawals first', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      saldo_aktif: 250000,
      saldo_tertahan: 50000,
    });
    prismaMock.withdrawal.findMany.mockResolvedValue([
      {
        id: 'withdrawal-2',
        amount: 75000,
        bank_name: 'BCA',
        account_name: 'Budi Santoso',
        account_number: '1234567890',
        notes: null,
        status: 'PENDING',
        processed_at: null,
        cancelled_at: null,
        failure_reason: null,
        createdAt: new Date('2026-05-04T12:00:00.000Z'),
        updatedAt: new Date('2026-05-04T12:00:00.000Z'),
      },
    ]);

    const result = await service.getMyWithdrawals('user-1');

    expect(result).toEqual({
      balance: {
        saldo_aktif: 250000,
        saldo_tertahan: 50000,
      },
      withdrawals: [
        expect.objectContaining({
          id: 'withdrawal-2',
          amount: 75000,
        }),
      ],
    });
  });

  it('cancels pending withdrawal and returns funds to saldo aktif', async () => {
    prismaMock.withdrawal.findFirst.mockResolvedValue({
      id: 'withdrawal-1',
      amount: 50000,
      bank_name: 'BCA',
      account_name: 'Budi Santoso',
      account_number: '1234567890',
      notes: null,
      status: 'PENDING',
      processed_at: null,
      cancelled_at: null,
      failure_reason: null,
      createdAt: new Date('2026-05-04T10:00:00.000Z'),
      updatedAt: new Date('2026-05-04T10:00:00.000Z'),
    });
    prismaMock.withdrawal.update.mockResolvedValue({
      id: 'withdrawal-1',
      amount: 50000,
      bank_name: 'BCA',
      account_name: 'Budi Santoso',
      account_number: '1234567890',
      notes: null,
      status: 'CANCELLED',
      processed_at: null,
      cancelled_at: new Date('2026-05-04T11:00:00.000Z'),
      failure_reason: null,
      createdAt: new Date('2026-05-04T10:00:00.000Z'),
      updatedAt: new Date('2026-05-04T11:00:00.000Z'),
    });
    prismaMock.user.update.mockResolvedValue({
      saldo_aktif: 100000,
      saldo_tertahan: 0,
    });
    prismaMock.$transaction.mockImplementation((callback: (tx: typeof prismaMock) => unknown) =>
      callback(prismaMock),
    );

    const result = await service.cancelMyWithdrawal('user-1', 'withdrawal-1');

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        saldo_aktif: { increment: 50000 },
        saldo_tertahan: { decrement: 50000 },
      },
      select: {
        saldo_aktif: true,
        saldo_tertahan: true,
      },
    });
    expect(result.withdrawal.status).toBe('CANCELLED');
  });

  it('throws when withdrawal does not belong to the current user', async () => {
    prismaMock.withdrawal.findFirst.mockResolvedValue(null);
    prismaMock.$transaction.mockImplementation((callback: (tx: typeof prismaMock) => unknown) =>
      callback(prismaMock),
    );

    await expect(service.cancelMyWithdrawal('user-1', 'missing')).rejects.toThrow(
      NotFoundException,
    );
  });
});
