import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CompleteUsernameDto {
  @ApiProperty({ example: 'budi_gaming' })
  @IsString()
  @IsNotEmpty({ message: 'Username tidak boleh kosong' })
  @MaxLength(30, { message: 'Username maksimal 30 karakter' })
  @Matches(/^[a-z0-9_]+$/, { message: 'Username hanya boleh huruf kecil, angka, dan underscore (_)' })
  username: string;
}
