export const APP_COLORS = {
   lightBackground: '#FAFAFA',
   darkBackground: '#000000',
   accent: '#22C55E',
} as const;

export const VIEW_COLORS = {
   onDark: '#FFFFFF',
   muted: '#A3A3A3',
   subtle: '#737373',
   softBorder: '#DBE3EF',
   mediaPlaceholder: '#E5E5E5',
   accentForeground: '#052E16',
   borderColor: '#E5E5E5',
} as const;

export const AUTH_INPUT_COLORS = {
   background: '#252525',
   activeOutline: VIEW_COLORS.onDark,
   outline: '#404040',
   placeholder: VIEW_COLORS.muted,
   text: '#FAFAFA',
} as const;

export function getAppBackground(isDark: boolean) {
   return isDark ? APP_COLORS.darkBackground : APP_COLORS.lightBackground;
}

export const CHIP_COLORS = {
   light: {
      background: '#F5F5F5',
      foreground: '#171717',
      border: '#E5E5E5',
      selectedBackground: '#0A0A0A',
      selectedForeground: '#FFFFFF',
      activeBackground: APP_COLORS.accent,
      activeForeground: '#052E16',
   },
   dark: {
      background: '#171717',
      foreground: '#EDEDED',
      border: '#262626',
      selectedBackground: '#FFFFFF',
      selectedForeground: '#000000',
      activeBackground: '#FFFFFF',
      activeForeground: '#052E16',
   },
} as const;

export const SWITCH_COLORS = {
   light: {
      falseTrack: '#D4D4D4',
      trueTrack: APP_COLORS.accent,
      falseThumb: '#FFFFFF',
      trueThumb: '#FFFFFF',
   },
   dark: {
      falseTrack: '#404040',
      trueTrack: APP_COLORS.accent,
      falseThumb: '#A3A3A3',
      trueThumb: '#FFFFFF',
   },
} as const;

export function getChipColors(isDark: boolean) {
   return isDark ? CHIP_COLORS.dark : CHIP_COLORS.light;
}

export function getSwitchColors(isDark: boolean) {
   return isDark ? SWITCH_COLORS.dark : SWITCH_COLORS.light;
}
