import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
describe('AuthService', () => {
  let service: AuthService;
  let prismaService: {
    user: {
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    prismaService = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('signed-jwt'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: MailService,
          useValue: {
            sendPasswordResetEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns a canonical auth payload with nama_lengkap when registering', async () => {
    prismaService.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    prismaService.user.create.mockResolvedValue({
      id: 'user-1',
      email: 'budi@example.com',
      nama_lengkap: 'Budi Santoso',
      username: 'budi_santoso',
      provider: 'local',
      role: 'BASIC',
      saldo_aktif: 0,
      saldo_tertahan: 0,
      kategori: null,
      bio: null,
      instagram: null,
      youtube: null,
      twitter: null,
    });

    const result = await service.register({
      email: 'budi@example.com',
      nama_lengkap: 'Budi Santoso',
      username: 'budi_santoso',
      password: 'Sandi1234',
    });

    expect(result).toEqual({
      access_token: 'signed-jwt',
      user: {
        id: 'user-1',
        nama_lengkap: 'Budi Santoso',
        username: 'budi_santoso',
        email: 'budi@example.com',
        provider: 'local',
        role: 'BASIC',
        saldo_aktif: 0,
        saldo_tertahan: 0,
        kategori: null,
        bio: null,
        instagram: null,
        youtube: null,
        twitter: null,
      },
      require_onboarding: false,
    });
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: 'user-1',
      email: 'budi@example.com',
      username: 'budi_santoso',
      role: 'BASIC',
    });
  });

  it('keeps provider and nama_lengkap after profile update', async () => {
    prismaService.user.findUnique.mockResolvedValue(null);
    prismaService.user.update.mockResolvedValue({
      id: 'user-1',
      email: 'budi@example.com',
      nama_lengkap: 'Budi Pro',
      username: 'budi_pro',
      provider: 'local',
      role: 'BASIC',
      saldo_aktif: 0,
      saldo_tertahan: 0,
      kategori: 'Gaming',
      bio: 'Streamer santai',
      instagram: 'budi.pro',
      youtube: null,
      twitter: null,
    });

    const result = await service.updateProfile('user-1', {
      nama_lengkap: 'Budi Pro',
      username: 'budi_pro',
      kategori: 'Gaming',
      bio: 'Streamer santai',
      instagram: 'budi.pro',
    });

    expect(result.user.nama_lengkap).toBe('Budi Pro');
    expect(result.user.provider).toBe('local');
    expect(result.user).not.toHaveProperty('nama');
  });
});
