import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleAuthDto {
  @ApiProperty({
    description: 'ID Token dari Google SDK di Frontend',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI...',
  })
  @IsNotEmpty()
  @IsString()
  id_token: string;
}
