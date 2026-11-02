import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/** tailwind-merge taught about our custom token scales (see libs/design-tokens). */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['ui', 'display'],
      radius: ['tag', 'control', 'card', 'panel', 'sheet', 'pill'],
      shadow: ['e1', 'e2', 'e3', 'brand'],
      ease: ['nova'],
    },
  },
});

/** Merge class names, letting later Tailwind classes win over earlier ones. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
