import { AUTH_INPUT_COLORS } from '@/theme/colors';

export const AUTH_INPUT_BACKGROUND = AUTH_INPUT_COLORS.background;

export const AUTH_INPUT_PROPS = {
   activeOutlineColor: AUTH_INPUT_COLORS.activeOutline,
   outlineColor: AUTH_INPUT_COLORS.outline,
   placeholderTextColor: AUTH_INPUT_COLORS.placeholder,
   textColor: AUTH_INPUT_COLORS.text,
   theme: {
      colors: {
         background: AUTH_INPUT_BACKGROUND,
         onSurface: AUTH_INPUT_COLORS.text,
         onSurfaceVariant: AUTH_INPUT_COLORS.placeholder,
         outline: AUTH_INPUT_COLORS.outline,
         primary: AUTH_INPUT_COLORS.activeOutline,
      },
   },
} as const;
