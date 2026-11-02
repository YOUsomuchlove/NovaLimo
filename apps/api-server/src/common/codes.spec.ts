import {
  bookingCode,
  randomCode,
  transferReference,
  waybillCode,
} from './codes';

describe('codes', () => {
  it('uses an unambiguous alphabet', () => {
    const c = randomCode(2000);
    expect(c).toMatch(/^[0-9A-HJKMNP-TV-Z]+$/);
    expect(c).not.toMatch(/[ILOU]/);
  });

  it('builds human codes', () => {
    expect(bookingCode()).toMatch(/^NL-[0-9A-Z]{6}$/);
    expect(waybillCode()).toMatch(/^CG-[0-9A-Z]{6}$/);
    expect(transferReference('NL-7K3M9Q')).toBe('NL7K3M9Q');
  });
});
