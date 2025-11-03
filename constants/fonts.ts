/**
 * Font configuration for the meteopixel app
 * Pixelify Sans font is prepared but not yet applied
 */

export const Fonts = {
  pixelify: 'PixelifySans-Regular',
} as const;

export type FontKey = keyof typeof Fonts;

