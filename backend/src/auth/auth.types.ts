import { Request } from 'express';

export type AuthenticatedUser = {
  id: string;
  email: string;
  nama_lengkap: string;
  username: string | null;
  provider: string;
  role: string;
  saldo_aktif?: number;
  saldo_tertahan?: number;
  kategori?: string | null;
  bio?: string | null;
  instagram?: string | null;
  youtube?: string | null;
  twitter?: string | null;
};

export type JwtPayload = {
  sub: string;
};

export type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};
