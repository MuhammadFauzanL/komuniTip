import { ApiProperty } from '@nestjs/swagger';

export class WithdrawalBalanceSummaryDto {
  @ApiProperty()
  saldo_aktif: number;

  @ApiProperty()
  saldo_tertahan: number;
}

export class WithdrawalItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  bank_name: string;

  @ApiProperty()
  account_name: string;

  @ApiProperty()
  account_number: string;

  @ApiProperty({ nullable: true, required: false })
  notes?: string | null;

  @ApiProperty()
  status: string;

  @ApiProperty({ nullable: true, required: false })
  processed_at?: Date | null;

  @ApiProperty({ nullable: true, required: false })
  cancelled_at?: Date | null;

  @ApiProperty({ nullable: true, required: false })
  failure_reason?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class WithdrawalListResponseDto {
  @ApiProperty({ type: WithdrawalBalanceSummaryDto })
  balance: WithdrawalBalanceSummaryDto;

  @ApiProperty({ type: [WithdrawalItemDto] })
  withdrawals: WithdrawalItemDto[];
}

export class CreateWithdrawalResponseDto {
  @ApiProperty({ type: WithdrawalBalanceSummaryDto })
  balance: WithdrawalBalanceSummaryDto;

  @ApiProperty({ type: WithdrawalItemDto })
  withdrawal: WithdrawalItemDto;
}
