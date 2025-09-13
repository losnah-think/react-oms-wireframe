/**
 * OMS Design System - Color Tokens
 * 
 * 전체 애플리케이션에서 사용되는 색상 토큰들을 정의합니다.
 * 브랜드 컬러, 의미적 컬러, 상태 컬러, 중성 컬러 등을 포함합니다.
 */

export const colors = {
  // Primary Brand Colors (007BED)
  primary: {
    50: '#e6f3ff',
    100: '#cce7ff', 
    200: '#99cfff',
    300: '#66b7ff',
    400: '#339fff',
    500: '#0087ff',
    600: '#007BED', // Main primary
    700: '#006bd4',
    800: '#005bb0',
    900: '#004b8c',
    950: '#003b68',
  },

  // Secondary Colors (5281C8)
  secondary: {
    50: '#f0f4ff',
    100: '#e1e9ff',
    200: '#c3d3ff',
    300: '#a5bdff',
    400: '#87a7ff',
    500: '#6991ff',
    600: '#5281C8', // Main secondary
    700: '#4a73b3',
    800: '#42659e',
    900: '#3a5789',
    950: '#324974',
  },

  // System Colors
  success: {
    50: '#e6f8f9',
    100: '#ccf1f3',
    200: '#99e3e7',
    300: '#66d5db',
    400: '#33c7cf',
    500: '#00b9c3',
    600: '#009CA8', // Main success
    700: '#00868f',
    800: '#007076',
    900: '#005a5d',
    950: '#004444',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Main warning
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },

  danger: {
    50: '#fef2f4',
    100: '#fde6e9',
    200: '#fbcdd3',
    300: '#f9b4bd',
    400: '#f79ba7',
    500: '#f58291',
    600: '#F34161', // Main danger
    700: '#e1395b',
    800: '#cf3155',
    900: '#bd294f',
    950: '#ab2149',
  },

  // Neutral/Gray Scale & System Colors
  gray: {
    50: '#FAFAFA',    // Base Background
    100: '#f3f4f6',
    200: '#E6E8EA',   // Base Disable
    300: '#d1d5db',
    400: '#ADB5BD',   // text disable, placeholder, btnPressed, Line
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },

  // Special Colors
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',

  // Effect Colors
  dim: 'rgba(6, 16, 29, 0.6)', // 06101D with 60% opacity

  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#FAFAFA',  // Base Background
    tertiary: '#f3f4f6',
    disabled: '#E6E8EA',   // Base Disable
    overlay: 'rgba(6, 16, 29, 0.6)',
  },

  // Border Colors
  border: {
    primary: '#ADB5BD',    // Line color
    secondary: '#E6E8EA',
    focus: '#007BED',      // Primary color for focus
    error: '#F34161',      // Danger color
  },

  // Text Colors
  text: {
    primary: '#111827',
    secondary: '#374151',
    tertiary: '#6b7280',
    disabled: '#ADB5BD',   // text disable
    placeholder: '#ADB5BD', // placeholder color
    inverse: '#ffffff',
    link: '#007BED',       // Primary color
    linkHover: '#006bd4',
  },

  // Button States
  button: {
    pressed: '#ADB5BD',    // btnPressed color
  },

  // Tag Colors (Product Tags)
  tag: {
    general: '#6b7280',
    material: '#007BED',
    feature: '#009CA8',
    quality: '#f59e0b',
    environmental: '#009CA8',
    usage: '#5281C8',
    season: '#F34161',
  },
} as const;

export type ColorToken = keyof typeof colors;
export type ColorVariant = keyof typeof colors.primary;
