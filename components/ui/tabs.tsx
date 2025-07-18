// Minimal Tabs component
import * as React from 'react'
type TabsProps = React.PropsWithChildren<{ value?: string; onValueChange?: (value: string) => void; defaultValue?: string; className?: string }>;
export function Tabs({ children, value, onValueChange, defaultValue, className = '', ...props }: TabsProps) {
  return <div className={className} {...props}>{children}</div>;
}
type TabsContentProps = React.PropsWithChildren<{ value?: string; className?: string }>;
export function TabsContent({ children, value, className = '', ...props }: TabsContentProps) {
  return <div className={className} data-value={value} {...props}>{children}</div>;
}
type TabsListProps = React.PropsWithChildren<{ className?: string }>;
export function TabsList({ children, className = '', ...props }: TabsListProps) {
  return <div className={className} {...props}>{children}</div>;
}
type TabsTriggerProps = React.PropsWithChildren<{ value?: string; className?: string }>;
export function TabsTrigger({ children, value, className = '', ...props }: TabsTriggerProps) {
  return <button className={className} data-value={value} {...props}>{children}</button>;
}
