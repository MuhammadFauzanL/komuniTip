import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
// Import UserRole from the correct path if Prisma Client isn't generated yet or use any
// It will be resolved once npx prisma generate is run correctly
import { UserRole } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    
    // Cek apakah user punya role yang dibutuhkan
    const hasRole = requiredRoles.includes(user?.role);

    if (!hasRole) {
      throw new ForbiddenException('Akses ditolak: Anda bukan Admin.');
    }

    return true;
  }
}
