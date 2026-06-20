import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength, Min } from 'class-validator';

const normalizeTrimmedText = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateWithdrawalDto {
  @ApiProperty({ example: 50000, minimum: 50000 })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsPositive()
  @Min(50000)
  amount: number;

  @ApiProperty({ example: 'BCA' })
  @Transform(normalizeTrimmedText)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  bank_name: string;

  @ApiProperty({ example: 'Budi Santoso' })
  @Transform(normalizeTrimmedText)
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  account_name: string;

  @ApiProperty({ example: '1234567890' })
  @Transform(normalizeTrimmedText)
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  account_number: string;

  @ApiProperty({ example: 'Pencairan minggu pertama Mei', required: false, nullable: true })
  @Transform(normalizeTrimmedText)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
