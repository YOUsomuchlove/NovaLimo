import type { Booking, TripBatch, TripRun, User, Vehicle } from './shared-types';

describe('shared-types', () => {
  it('exports core types', () => {
    const _vehicle: Vehicle = {
      id: 'v1',
      license_plate: '29B-12345',
      capacity: 10,
      status: 'AVAILABLE',
    };
    const _user: User = {
      id: 'u1',
      full_name: 'Driver',
      phone: '0900000000',
      role: 'DRIVER',
      status: 'ACTIVE',
    };
    const _batch: TripBatch = {
      id: 'b1',
      route_name: 'HN-QN',
      departure_time: new Date().toISOString(),
      status: 'OPEN',
    };
    const _run: TripRun = {
      id: 'r1',
      trip_batch_id: _batch.id,
      vehicle_id: _vehicle.id,
      driver_id: _user.id,
      status: 'PENDING',
    };
    const _booking: Booking = {
      id: 'bk1',
      trip_batch_id: _batch.id,
      trip_run_id: _run.id,
      passenger_name: 'A',
      passenger_phone: '09',
      pickup_address: 'Pickup',
      pickup_location: { lat: 0, lng: 0 },
      dropoff_address: 'Dropoff',
      dropoff_location: { lat: 0, lng: 0 },
      status: 'WAITING',
    };

    expect(_booking.trip_run_id).toEqual('r1');
  });
});
