import { Module } from '@nestjs/common';
import { DonationController } from './donation.controller';
import { DonationService } from './donation.service';
import { AiModerationModule } from '../ai/ai-moderation.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [AiModerationModule, PaymentModule],
  controllers: [DonationController],
  providers: [DonationService],
  exports: [DonationService],
})
export class DonationModule {}
