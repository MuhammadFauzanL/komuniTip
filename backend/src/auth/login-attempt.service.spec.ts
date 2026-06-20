import { HttpException } from '@nestjs/common';
import { LoginAttemptService } from './login-attempt.service';
import { PrismaService } from '../prisma/prisma.service';

describe('LoginAttemptService', () => {
  let service: LoginAttemptService;
  let prismaService: {
    loginAttempt: {
      findUnique: jest.Mock;
      upsert: jest.Mock;
      delete: jest.Mock;
      deleteMany: jest.Mock;
    };
  };

  beforeEach(() => {
    prismaService = {
      loginAttempt: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
    };
    service = new LoginAttemptService(prismaService as unknown as PrismaService);
  });

  it('locks an identifier and ip combination after five failures', async () => {
    prismaService.loginAttempt.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ failed_attempts: 1 })
      .mockResolvedValueOnce({ failed_attempts: 2 })
      .mockResolvedValueOnce({ failed_attempts: 3 })
      .mockResolvedValueOnce({ failed_attempts: 4 })
      .mockResolvedValueOnce({
        identifier: 'budi@example.com',
        client_ip: '127.0.0.1',
        locked_until: new Date(Date.now() + 60_000),
      });

    for (let i = 0; i < 5; i += 1) {
      await service.recordFailure('Budi@example.com', '127.0.0.1');
    }

    await expect(
      service.assertNotLocked('budi@example.com', '127.0.0.1'),
    ).rejects.toThrow(HttpException);
  });

  it('resets failures after a successful login', async () => {
    await service.reset('budi@example.com', '127.0.0.1');

    expect(prismaService.loginAttempt.deleteMany).toHaveBeenCalledWith({
      where: {
        identifier: 'budi@example.com',
        client_ip: '127.0.0.1',
      },
    });
  });

  it('clears expired lockouts before allowing another attempt', async () => {
    prismaService.loginAttempt.findUnique.mockResolvedValue({
      identifier: 'budi@example.com',
      client_ip: '127.0.0.1',
      locked_until: new Date(Date.now() - 1_000),
    });

    await service.assertNotLocked('budi@example.com', '127.0.0.1');

    expect(prismaService.loginAttempt.delete).toHaveBeenCalledWith({
      where: {
        identifier_client_ip: {
          identifier: 'budi@example.com',
          client_ip: '127.0.0.1',
        },
      },
    });
  });
});
