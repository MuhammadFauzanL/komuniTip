import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginAttemptService } from './login-attempt.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { login: jest.Mock };
  let loginAttemptService: {
    assertNotLocked: jest.Mock;
    recordFailure: jest.Mock;
    reset: jest.Mock;
  };
  const mockRequest = { ip: '127.0.0.1', headers: {} } as any;

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
    };
    loginAttemptService = {
      assertNotLocked: jest.fn().mockResolvedValue(undefined),
      recordFailure: jest.fn().mockResolvedValue(undefined),
      reset: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
        {
          provide: LoginAttemptService,
          useValue: loginAttemptService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('records a failed login attempt when credentials are invalid', async () => {
    authService.login.mockRejectedValue(new UnauthorizedException('invalid'));

    await expect(
      controller.login(
        { identifier: 'budi@example.com', password: 'wrong' },
        mockRequest,
      ),
    ).rejects.toThrow(UnauthorizedException);

    expect(loginAttemptService.assertNotLocked).toHaveBeenCalledWith(
      'budi@example.com',
      '127.0.0.1',
    );
    expect(loginAttemptService.recordFailure).toHaveBeenCalledWith(
      'budi@example.com',
      '127.0.0.1',
    );
    expect(loginAttemptService.reset).not.toHaveBeenCalled();
  });

  it('resets login attempts after a successful login', async () => {
    authService.login.mockResolvedValue({ access_token: 'token', user: { id: 'user-1' } });

    await controller.login(
      { identifier: 'budi@example.com', password: 'correct' },
      mockRequest,
    );

    expect(loginAttemptService.reset).toHaveBeenCalledWith('budi@example.com', '127.0.0.1');
    expect(loginAttemptService.recordFailure).not.toHaveBeenCalled();
  });
});
