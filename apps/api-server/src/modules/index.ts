import { BookingModule } from './booking/booking.module';
import { CatalogModule } from './catalog/catalog.module';
import { NotifyModule } from './notify/notify.module';
import { SettingsModule } from './settings/settings.module';
import { TripsModule } from './trips/trips.module';

/** Business feature modules, registered in AppModule. */
export const FEATURE_MODULES = [
  SettingsModule,
  NotifyModule,
  CatalogModule,
  TripsModule,
  BookingModule,
];
