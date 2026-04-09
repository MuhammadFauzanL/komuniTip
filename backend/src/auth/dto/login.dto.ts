import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'budi@gmail.com' })
  @IsString()
  @IsNotEmpty({ message: 'Email atau Username wajib diisi' })
  identifier: string;

  @ApiProperty({ example: 'SandiRahasia123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
