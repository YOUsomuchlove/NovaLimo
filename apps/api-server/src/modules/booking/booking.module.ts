import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { TripsModule } from '../trips/trips.module';
import {
  BookingAdminController,
  BookingPublicController,
  PaymentWebhookController,
} from './booking.controllers';
import { BookingService } from './booking.service';
import { OtpService } from './otp.service';

@Module({
  imports: [CatalogModule, TripsModule],
  controllers: [
    BookingPublicController,
    BookingAdminController,
    PaymentWebhookController,
  ],
  providers: [BookingService, OtpService],
  exports: [BookingService],
})
export class BookingModule {}
