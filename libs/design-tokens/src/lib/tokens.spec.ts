import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { contrastRatio } from './contrast';
import { generateTokensCss } from './css';
import { palette } from './palette';
import { darkTheme, lightTheme } from './semantic';

describe('design tokens', () => {
  it('generated tokens.css is up to date (run `nx run design-tokens:generate`)', () => {
    const onDisk = readFileSync(
      join(__dirname, '..', 'generated', 'tokens.css'),
      'utf8',
    );
    expect(onDisk.replace(/\r\n/g, '\n')).toBe(generateTokensCss());
  });

  describe('WCAG AA contrast', () => {
    const AA = 4.5;
    const AA_LARGE = 3;

    it.each([
      ['dark fg / canvas', darkTheme.fg, darkTheme.canvas, AA],
      [
        'dark fgSecondary / surface1',
        darkTheme.fgSecondary,
        darkTheme.surface1,
        AA,
      ],
      ['dark fgMuted / surface2', darkTheme.fgMuted, darkTheme.surface2, AA],
      ['dark brandFg / surface1', darkTheme.brandFg, darkTheme.surface1, AA],
      ['onBrand / brand (gold button)', darkTheme.onBrand, darkTheme.brand, AA],
      [
        'dark success fg / surface1',
        darkTheme.success.fg,
        darkTheme.surface1,
        AA,
      ],
      [
        'dark danger fg / surface1',
        darkTheme.danger.fg,
        darkTheme.surface1,
        AA,
      ],
      ['light fg / canvas', lightTheme.fg, lightTheme.canvas, AA],
      ['light fgMuted / surface1', lightTheme.fgMuted, lightTheme.surface1, AA],
      ['light brandFg / surface1', lightTheme.brandFg, lightTheme.surface1, AA],
      [
        'light success fg / surface1',
        lightTheme.success.fg,
        lightTheme.surface1,
        AA,
      ],
      [
        'light danger fg / surface1',
        lightTheme.danger.fg,
        lightTheme.surface1,
        AA,
      ],
      [
        'dark fgDisabled / surface1 (large only)',
        darkTheme.fgDisabled,
        darkTheme.surface1,
        AA_LARGE - 0.5,
      ],
    ])('%s ≥ %s', (_label, fg, bg, min) => {
      expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(min);
    });
  });

  it('keeps the brand anchors from the Pencil files', () => {
    expect(palette.gold[500]).toBe('#D4AF37');
    expect(palette.navy[800]).toBe('#0B1020');
  });
});
