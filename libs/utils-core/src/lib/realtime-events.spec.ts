import { RealtimeEvents } from './realtime-events';

describe('RealtimeEvents', () => {
  it('giữ ổn định tên sự kiện socket (đồng bộ gateway)', () => {
    expect(RealtimeEvents.tripBatchUpdated).toBe('trip_batch_updated');
    expect(RealtimeEvents.driverChat).toBe('driver_chat');
    expect(RealtimeEvents.shiftStarted).toBe('driver_shift_started');
  });
});
