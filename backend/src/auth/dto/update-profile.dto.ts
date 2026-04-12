import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Budi Pro' })
  @IsString()
  @IsOptional()
  nama?: string;

  @ApiProperty({ example: 'budi_unique' })
  @IsString()
  @IsOptional()
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
