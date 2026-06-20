import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
import { USERNAME_MAX_LENGTH, USERNAME_PATTERN } from '../auth.validation';

export class CompleteUsernameDto {
  @ApiProperty({ example: 'budi_gaming' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsString()
  @IsNotEmpty({ message: 'Username tidak boleh kosong' })
  @MaxLength(USERNAME_MAX_LENGTH, { message: 'Username maksimal 30 karakter' })
  @Matches(USERNAME_PATTERN, { message: 'Username hanya boleh huruf kecil, angka, dan underscore (_)' })
  username: string;
}
