import { Module } from '@nestjs/common';
import { DonationController } from './donation.controller';
import { DonationService } from './donation.service';
import { AiModerationModule } from '../ai/ai-moderation.module';

@Module({
  imports: [AiModerationModule], // Import AI module agar bisa inject AiModerationService
  controllers: [DonationController],
  providers: [DonationService],
  exports: [DonationService], // Export agar nanti PaymentModule bisa akses
})
export class DonationModule {}
