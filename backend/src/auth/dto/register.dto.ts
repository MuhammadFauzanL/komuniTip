import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'budi@gmail.com' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Budi Santoso' })
  @IsString()
  @IsNotEmpty()
  nama_lengkap: string;

  @ApiProperty({ example: 'budi_santoso', description: 'Maks. 30 karakter tanpa spasi' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'SandiRahasia123', description: 'Minimal 6 karakter' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password: string;
}
