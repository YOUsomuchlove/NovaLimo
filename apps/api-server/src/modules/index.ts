import { BookingModule } from './booking/booking.module';
import { CatalogModule } from './catalog/catalog.module';
import { NotifyModule } from './notify/notify.module';
import { OpsModule } from './ops/ops.module';
import { PeopleModule } from './people/people.module';
import { SettingsModule } from './settings/settings.module';
import { TripsModule } from './trips/trips.module';
import { UploadsModule } from './uploads/uploads.module';

/** Business feature modules, registered in AppModule. */
export const FEATURE_MODULES = [
  SettingsModule,
  NotifyModule,
  UploadsModule,
  PeopleModule,
  CatalogModule,
  TripsModule,
  BookingModule,
  OpsModule,
];
