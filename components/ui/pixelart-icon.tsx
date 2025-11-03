/**
 * Pixelarticons icon component
 * Prepared but not yet applied to maintain current appearance
 * 
 * Usage:
 * <PixelartIcon name="home" size={24} color="#58a6ff" />
 * 
 * Icons are auto-generated from the pixelarticons package.
 * Run: bun run scripts/generate-pixelart-icons.ts to regenerate icon mappings
 */

import { PIXELART_ICON_PATHS, PixelartIconName } from '@/constants/pixelart-icons';
import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export type { PixelartIconName } from '@/constants/pixelart-icons';

export interface PixelartIconProps {
  name: PixelartIconName;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * PixelartIcon component for rendering Pixelarticons
 * Note: This component is prepared but not yet applied to maintain current appearance
 * 
 * All icons from the pixelarticons package are available via the generated mappings.
 */
export function PixelartIcon({
  name,
  size = 24,
  color = '#000000',
  style,
}: PixelartIconProps) {
  const pathData = PIXELART_ICON_PATHS[name];

  if (!pathData) {
    console.warn(`PixelartIcon: Icon "${name}" not found`);
    return null;
  }

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={style}
      fill="none"
    >
      <Path d={pathData} fill={color} />
    </Svg>
  );
}

