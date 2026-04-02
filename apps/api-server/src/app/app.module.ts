import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminController } from './admin/admin.controller';
import { AdminService } from './admin/admin.service';
import { AuthModule } from './auth/auth.module';
import { BookingsController } from './bookings/bookings.controller';
import { BookingsService } from './bookings/bookings.service';
import { CargosController } from './cargos/cargos.controller';
import { CargosService } from './cargos/cargos.service';
import { GeocodeController } from './geocode/geocode.controller';
import { GeocodeService } from './geocode/geocode.service';
import { DatabaseModule } from './database/database.module';
import { DispatchModule } from './dispatch/dispatch.module';
import { DriversController } from './drivers/drivers.controller';
import { DriversService } from './drivers/drivers.service';
import { EventsModule } from './events/events.module';
import { TripBatchesController } from './trip-batches/trip-batches.controller';
import { TripBatchesService } from './trip-batches/trip-batches.service';
import { TripRunsController } from './trip-runs/trip-runs.controller';
import { TripRunsService } from './trip-runs/trip-runs.service';
import { TripsController } from './trips/trips.controller';
import { TripsService } from './trips/trips.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { VehiclesController } from './vehicles/vehicles.controller';
import { VehiclesService } from './vehicles/vehicles.service';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    EventsModule,
    DispatchModule,
  ],
  controllers: [
    AppController,
    AdminController,
    BookingsController,
    CargosController,
    GeocodeController,
    TripBatchesController,
    TripRunsController,
    TripsController,
    UsersController,
    VehiclesController,
  ],
  providers: [
    AppService,
    AdminService,
    BookingsService,
    CargosService,
    GeocodeService,
    TripBatchesService,
    TripRunsService,
    TripsService,
    UsersService,
    VehiclesService,
    DriversService,
  ],
})
export class AppModule {}
