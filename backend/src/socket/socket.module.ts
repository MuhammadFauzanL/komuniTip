import { Module, Global } from '@nestjs/common';
import { DonationGateway } from './donation.gateway';

@Global()
@Module({
  providers: [DonationGateway],
  exports: [DonationGateway], // Make exports available globally so we don't have circular dependencies with Payment
})
export class SocketModule {}
