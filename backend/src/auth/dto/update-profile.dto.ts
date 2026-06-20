import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsOptional, Matches, MaxLength, MinLength } from 'class-validator';
import {
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_PATTERN,
} from '../auth.validation';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Budi Pro' })
  @IsString()
  @IsOptional()
  nama_lengkap?: string;

  @ApiProperty({ example: 'budi_unique' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsString()
  @IsOptional()
  @MinLength(USERNAME_MIN_LENGTH, { message: 'Username minimal 3 karakter' })
  @MaxLength(USERNAME_MAX_LENGTH, { message: 'Username maksimal 30 karakter' })
  @Matches(USERNAME_PATTERN, {
    message: 'Username hanya boleh berisi huruf kecil, angka, dan underscore tanpa spasi',
  })
  username?: string;

  @ApiProperty({ example: 'Gaming' })
  @IsString()
  @IsOptional()
  kategori?: string;

  @ApiProperty({ example: 'Kreator konten gaming santai' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({ example: 'budi.gaming' })
  @IsString()
  @IsOptional()
  instagram?: string;

  @ApiProperty({ example: 'https://youtube.com/budi' })
  @IsString()
  @IsOptional()
  youtube?: string;

  @ApiProperty({ example: 'budigamer' })
  @IsString()
  @IsOptional()
  twitter?: string;
}
