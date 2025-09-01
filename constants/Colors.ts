/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    // Church app specific colors
    primary: '#2563eb', // Blue for primary elements
    secondary: '#64748b', // Gray for secondary elements
    accent: '#dc2626', // Red for important actions
    lightGray: '#f1f5f9', // Light gray for backgrounds
    mediumGray: '#cbd5e1', // Medium gray for cards
    darkGray: '#475569', // Dark gray for text
    success: '#16a34a', // Green for confirmed status
    warning: '#ca8a04', // Yellow for pending status
    error: '#dc2626', // Red for absent status
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    // Church app specific colors
    primary: '#3b82f6',
    secondary: '#94a3b8',
    accent: '#ef4444',
    lightGray: '#1e293b',
    mediumGray: '#334155',
    darkGray: '#cbd5e1',
    success: '#22c55e',
    warning: '#eab308',
    error: '#ef4444',
  },
};
