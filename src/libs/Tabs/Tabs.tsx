import {
  Tabs as MTabs,
  type TabsProps,
  type TabsListProps,
  type TabsTabProps,
  type TabsPanelProps,
} from '@mantine/core';
import type { ReactNode } from 'react';

type TTabsProps = TabsProps & {
  children: ReactNode;
};

type TabListProps = TabsListProps & {
  children: ReactNode;
};

type TabItemProps = TabsTabProps;

type TabPanelProps = TabsPanelProps;

export function Tabs({
  children,
  orientation = 'vertical',
  ...props
}: TTabsProps) {
  return (
    <MTabs
      styles={{
        tab: {
          padding: '14px 24px',
          fontSize: '18px',
          fontWeight: 600,
        },
      }}
      orientation={orientation}
      {...props}
    >
      {children}
    </MTabs>
  );
}

export function TabList({ children, ...props }: TabListProps) {
  return <MTabs.List {...props}>{children}</MTabs.List>;
}

export function TabItem({ children, ...props }: TabItemProps) {
  return <MTabs.Tab {...props}>{children}</MTabs.Tab>;
}

export function TabContent({ children, ...props }: TabPanelProps) {
  return (
    <MTabs.Panel ml={'lg'} {...props}>
      {children}
    </MTabs.Panel>
  );
}
