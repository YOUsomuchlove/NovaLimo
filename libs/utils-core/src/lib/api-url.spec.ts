import { getSocketOriginFromApiBaseUrl } from './api-url';

describe('getSocketOriginFromApiBaseUrl', () => {
  it('strips /api suffix', () => {
    expect(getSocketOriginFromApiBaseUrl('http://localhost:3000/api')).toBe(
      'http://localhost:3000',
    );
  });

  it('strips trailing slash and /api', () => {
    expect(getSocketOriginFromApiBaseUrl('http://localhost:3000/api/')).toBe(
      'http://localhost:3000',
    );
  });

  it('passes through origin without /api', () => {
    expect(getSocketOriginFromApiBaseUrl('http://10.0.2.2:3000')).toBe(
      'http://10.0.2.2:3000',
    );
  });
});
