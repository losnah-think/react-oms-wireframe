/**
 * OMS Design System - Design Tokens Index
 * 
 * 모든 디자인 토큰들을 한 곳에서 export하는 진입점입니다.
 */

export * from './colors';
export * from './typography';
export * from './spacing';

// Re-export common tokens for convenience
export { colors } from './colors';
export { typography } from './typography';
export { spacing, borderRadius, shadows } from './spacing';
