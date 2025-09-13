/**
 * OMS Design System - Typography Tokens
 * 
 * 폰트 크기, 줄 높이, 폰트 무게 등 타이포그래피 관련 토큰들을 정의합니다.
 */

export const typography = {
  // Font Families
  fontFamily: {
    sans: ['Pretendard', 'sans-serif'],
    mono: ['Pretendard', 'monospace'],
  },

  // Font Sizes
  fontSize: {
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem',  // 72px
    '8xl': '6rem',    // 96px
    '9xl': '8rem',    // 128px
  },

  // Font Weights
  fontWeight: {
    thin: 100,
    extraLight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
    extraBold: 800,
    black: 900,
  },

  // Line Heights
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // Text Styles (Semantic Typography)
  textStyles: {
    // Headings
    h1: {
      fontSize: '2.25rem',   // 36px
      fontWeight: 700,
      lineHeight: 1.25,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '1.875rem',  // 30px
      fontWeight: 600,
      lineHeight: 1.25,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: '1.5rem',    // 24px
      fontWeight: 600,
      lineHeight: 1.375,
      letterSpacing: 'normal',
    },
    h4: {
      fontSize: '1.25rem',   // 20px
      fontWeight: 600,
      lineHeight: 1.375,
      letterSpacing: 'normal',
    },
    h5: {
      fontSize: '1.125rem',  // 18px
      fontWeight: 600,
      lineHeight: 1.375,
      letterSpacing: 'normal',
    },
    h6: {
      fontSize: '1rem',      // 16px
      fontWeight: 600,
      lineHeight: 1.375,
      letterSpacing: 'normal',
    },

    // Body Text
    bodyLarge: {
      fontSize: '1.125rem',  // 18px
      fontWeight: 400,
      lineHeight: 1.625,
      letterSpacing: 'normal',
    },
    body: {
      fontSize: '1rem',      // 16px
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: 'normal',
    },
    bodySmall: {
      fontSize: '0.875rem',  // 14px
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: 'normal',
    },

    // Labels and UI Text
    label: {
      fontSize: '0.875rem',  // 14px
      fontWeight: 500,
      lineHeight: 1.375,
      letterSpacing: 'normal',
    },
    labelSmall: {
      fontSize: '0.75rem',   // 12px
      fontWeight: 500,
      lineHeight: 1.375,
      letterSpacing: 'wide',
    },
    
    // Button Text
    buttonLarge: {
      fontSize: '1rem',      // 16px
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: 'normal',
    },
    button: {
      fontSize: '0.875rem',  // 14px
      fontWeight: 500,
      lineHeight: 1.375,
      letterSpacing: 'normal',
    },
    buttonSmall: {
      fontSize: '0.75rem',   // 12px
      fontWeight: 500,
      lineHeight: 1.375,
      letterSpacing: 'wide',
    },

    // Caption and Helper Text
    caption: {
      fontSize: '0.75rem',   // 12px
      fontWeight: 400,
      lineHeight: 1.375,
      letterSpacing: 'normal',
    },
    overline: {
      fontSize: '0.75rem',   // 12px
      fontWeight: 500,
      lineHeight: 1.375,
      letterSpacing: 'widest',
      textTransform: 'uppercase' as const,
    },

    // Code
    code: {
      fontSize: '0.875rem',  // 14px
      fontWeight: 400,
      lineHeight: 1.375,
      letterSpacing: 'normal',
      fontFamily: ['SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', 'Courier', 'monospace'],
    },
  },
} as const;

export type TypographyToken = keyof typeof typography;
export type TextStyle = keyof typeof typography.textStyles;
