import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { BookingsModule } from './bookings/bookings.module';
import { CargosModule } from './cargos/cargos.module';
import { CustomersModule } from './customers/customers.module';
import { DatabaseModule } from './database/database.module';
import { DispatchModule } from './dispatch/dispatch.module';
import { DriversModule } from './drivers/drivers.module';
import { EventsModule } from './events/events.module';
import { FinanceModule } from './finance/finance.module';
import { GeocodeModule } from './geocode/geocode.module';
import { RbacModule } from './rbac/rbac.module';
import { TripBatchesModule } from './trip-batches/trip-batches.module';
import { TripRunsModule } from './trip-runs/trip-runs.module';
import { TripsModule } from './trips/trips.module';
import { UsersModule } from './users/users.module';
import { VehiclesModule } from './vehicles/vehicles.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    EventsModule,
    TripBatchesModule,
    BookingsModule,
    TripRunsModule,
    TripsModule,
    DriversModule,
    CargosModule,
    GeocodeModule,
    AdminModule,
    DispatchModule,
    FinanceModule,
    CustomersModule,
    RbacModule,
    UsersModule,
    VehiclesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
