import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsHexColor,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateOverlaySettingsDto {
  @ApiPropertyOptional({ example: 10000, description: 'Minimum nominal agar alert tampil' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Minimum donasi harus berupa angka bulat' })
  @Min(1000, { message: 'Minimum donasi minimal Rp 1.000' })
  min_donasi_alert?: number;

  @ApiPropertyOptional({ example: 8, description: 'Durasi alert dalam detik' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Durasi alert harus berupa angka bulat' })
  @Min(4, { message: 'Durasi alert minimal 4 detik' })
  durasi_alert?: number;

  @ApiPropertyOptional({ example: '{name} baru saja memberikan {amount}' })
  @IsOptional()
  @IsString()
  @MaxLength(120, { message: 'Template text maksimal 120 karakter' })
  template_text?: string;

  @ApiPropertyOptional({ example: 'Inter' })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Nama font maksimal 50 karakter' })
  font_family?: string;

  @ApiPropertyOptional({ example: '#FFFFFF' })
  @IsOptional()
  @IsHexColor({ message: 'Warna nama harus berupa hex color yang valid' })
  nama_color?: string;

  @ApiPropertyOptional({ example: '#2BBBA0' })
  @IsOptional()
  @IsHexColor({ message: 'Warna template harus berupa hex color yang valid' })
  template_color?: string;

  @ApiPropertyOptional({ example: '#3BA2FF' })
  @IsOptional()
  @IsHexColor({ message: 'Warna nominal harus berupa hex color yang valid' })
  amount_color?: string;

  @ApiPropertyOptional({ example: '#FF914D' })
  @IsOptional()
  @IsHexColor({ message: 'Warna pesan harus berupa hex color yang valid' })
  message_color?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  sound_enabled?: boolean;

  @ApiPropertyOptional({ example: 200000, description: 'Minimum nominal agar sound alert diputar' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Minimum sound alert harus berupa angka bulat' })
  @Min(1000, { message: 'Minimum sound alert minimal Rp 1.000' })
  sound_min_donasi?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  tts_enabled?: boolean;
}
