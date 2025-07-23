/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#2E5A3D'; // Dark green from logo
const tintColorDark = '#FF8C42'; // Warm orange from logo

export const Colors = {
  light: {
    text: '#2E2E2E',
    background: '#FDFBF7', // Cream background
    tint: tintColorLight,
    tabIconDefault: '#8E8E93',
    tabIconSelected: tintColorLight,
    primary: '#2E5A3D', // Dark green
    secondary: '#FF8C42', // Warm orange
    accent: '#E67E22', // Slightly darker orange
    surface: '#FFFFFF',
    surfaceVariant: '#F8F6F0',
    border: '#E0D8C8',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
    // Curious Road specific colors
    curiousGreen: '#2E5A3D',
    curiousOrange: '#FF8C42',
    curiousCream: '#FDFBF7',
    curiousWarm: '#F8F6F0',
    curiousBorder: '#E0D8C8',
    curiousText: '#2E2E2E',
    curiousTextSecondary: '#666666',
  },
  dark: {
    text: '#FDFBF7',
    background: '#1A1A1A',
    tint: tintColorDark,
    tabIconDefault: '#8E8E93',
    tabIconSelected: tintColorDark,
    primary: '#FF8C42', // Warm orange for dark mode
    secondary: '#2E5A3D', // Dark green for dark mode
    accent: '#E67E22',
    surface: '#2A2A2A',
    surfaceVariant: '#333333',
    border: '#404040',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
    // Curious Road specific colors
    curiousGreen: '#4A7C59',
    curiousOrange: '#FF8C42',
    curiousCream: '#2A2A2A',
    curiousWarm: '#333333',
    curiousBorder: '#404040',
    curiousText: '#FDFBF7',
    curiousTextSecondary: '#CCCCCC',
  },
};
