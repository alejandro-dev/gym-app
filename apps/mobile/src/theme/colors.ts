export const APP_COLORS = {
   lightBackground: '#f8fafc',
   darkBackground: '#020617',
} as const;

export function getAppBackground(isDark: boolean) {
   return isDark ? APP_COLORS.darkBackground : APP_COLORS.lightBackground;
}
