import { ApiProperty } from '@nestjs/swagger';

export class ProfileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  nama_lengkap: string;

  @ApiProperty({ nullable: true })
  username: string | null;

  @ApiProperty()
  provider: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  saldo_aktif: number;

  @ApiProperty()
  saldo_tertahan: number;

  @ApiProperty({ nullable: true, required: false })
  kategori?: string | null;

  @ApiProperty({ nullable: true, required: false })
  bio?: string | null;

  @ApiProperty({ nullable: true, required: false })
  instagram?: string | null;

  @ApiProperty({ nullable: true, required: false })
  youtube?: string | null;

  @ApiProperty({ nullable: true, required: false })
  twitter?: string | null;

  @ApiProperty()
  createdAt: Date;
}
