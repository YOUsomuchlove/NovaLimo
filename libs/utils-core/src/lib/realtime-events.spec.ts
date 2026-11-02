import { RealtimeEvents, realtimeRooms } from './realtime-events';

describe('RealtimeEvents', () => {
  it('keeps socket event names stable (shared by gateway and clients)', () => {
    expect(RealtimeEvents.seatsChanged).toBe('seats_changed');
    expect(RealtimeEvents.driverLocation).toBe('driver_location');
    expect(RealtimeEvents.chatMessage).toBe('chat_message');
  });

  it('builds room names', () => {
    expect(realtimeRooms.driver('42')).toBe('driver:42');
    expect(realtimeRooms.batch('b1')).toBe('batch:b1');
  });
});
