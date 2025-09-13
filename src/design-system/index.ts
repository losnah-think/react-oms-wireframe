/**
 * OMS Design System
 * 
 * 전체 애플리케이션에서 사용되는 디자인 시스템의 진입점입니다.
 * 디자인 토큰, 컴포넌트, 유틸리티를 export합니다.
 */

// Design Tokens
export * from './tokens';

// Components - explicit per-component re-exports for better tree-shaking
export { default as Button, type ButtonProps } from './components/Button';
export { default as Input, type InputProps } from './components/Input';
export { default as Card, type CardProps } from './components/Card';
export { default as Container, type ContainerProps } from './components/Container';
export { default as Stack, type StackProps } from './components/Stack';
export { default as Badge, type BadgeProps } from './components/Badge';
export { default as Modal, type ModalProps } from './components/Modal';
export { default as Dropdown, type DropdownProps, type DropdownOption } from './components/Dropdown';
export { default as Icon, type IconProps, iconLibrary } from './components/Icon';
export { default as Table, type TableProps, type TableColumn } from './components/Table';
export { default as Tabs, type TabsProps, type TabItem } from './components/Tabs';
export {
  default as Grid,
  GridContainer,
  GridItem,
  GridRow,
  GridCol,
  Row,
  Col,
  GridStyles
} from './components/Grid';

// Convenience re-exports
export { colors, typography, spacing, borderRadius, shadows } from './tokens';
