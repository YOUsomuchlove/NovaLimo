import { AppController } from './app.controller';

describe('AppController', () => {
  it('returns ok payload', () => {
    const c = new AppController();
    expect(c.root()).toEqual(
      expect.objectContaining({ ok: true, name: 'NovaLimo API' }),
    );
  });
});
