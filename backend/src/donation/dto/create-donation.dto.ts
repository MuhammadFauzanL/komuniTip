import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, MaxLength, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDonationDto {
  @ApiProperty({ example: 'Budi Ganteng', description: 'Nama donatur yang akan tampil di overlay' })
  @IsString()
  @IsNotEmpty({ message: 'Nama donatur wajib diisi' })
  @MaxLength(100, { message: 'Nama donatur maksimal 100 karakter' })
  nama_donatur: string;

  @ApiProperty({ example: 'budi@gmail.com', required: false })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsOptional()
  email_donatur?: string;

  @ApiProperty({ example: 'Semangat terus bang! 🔥', required: false, description: 'Pesan yang akan tampil di overlay' })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Pesan maksimal 500 karakter' })
  pesan?: string;

  @ApiProperty({ example: 25000, description: 'Nominal donasi dalam Rupiah (min Rp 10.000)' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Jumlah donasi harus berupa angka' })
  @Min(10000, { message: 'Donasi minimal Rp 10.000' })
  jumlah: number;
}
