import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'budi@gmail.com' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Budi Santoso' })
  @IsString()
  @IsNotEmpty()
  nama_lengkap: string;

  @ApiProperty({ example: 'budi_santoso', description: '3-30 karakter, hanya huruf kecil, angka, dan underscore' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Username minimal 3 karakter' })
  @MaxLength(30, { message: 'Username maksimal 30 karakter' })
  @Matches(/^[a-z0-9_]+$/, {
    message: 'Username hanya boleh berisi huruf kecil, angka, dan underscore tanpa spasi',
  })
  username: string;

  @ApiProperty({ example: 'SandiRahasia123', description: 'Minimal 8 karakter, mengandung huruf dan angka' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)/, {
    message: 'Password harus mengandung minimal 1 huruf dan 1 angka',
  })
  password: string;
}
