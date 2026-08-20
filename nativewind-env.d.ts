/// <reference types="nativewind/types" />
declare module '*.css';

declare module '@tabler/icons-react-native/*' {
  import { ComponentType } from 'react';
  interface TablerIconProps {
    size?: number;
    color?: string;
  }
  const Icon: ComponentType<TablerIconProps>;
  export default Icon;
}