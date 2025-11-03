/**
 * Font loading configuration for Pixelify Sans
 * Prepared but not yet applied - fonts are loaded but not used in styling yet
 * 
 * To apply the font, use useFonts hook in _layout.tsx and reference Fonts.pixelify
 */

import { useFonts as useExpoFonts } from 'expo-font';
import { Fonts } from './fonts';

export function useFonts() {
  const [fontsLoaded, fontError] = useExpoFonts({
    [Fonts.pixelify]: require('../assets/fonts/PixelifySans-Regular.ttf'),
  });

  return { fontsLoaded, fontError };
}

