// Minimal Select component
import * as React from 'react'
type SelectProps = React.PropsWithChildren<{ value?: string; onValueChange?: (value: string) => void }>;
export function Select({ children, value, onValueChange, ...props }: SelectProps) {
  return <select value={value} onChange={e => onValueChange?.(e.target.value)} {...props}>{children}</select>;
}
type SelectContentProps = React.PropsWithChildren<{ className?: string }>;
export function SelectContent({ children, className = '', ...props }: SelectContentProps) {
  return <div className={className} {...props}>{children}</div>;
}
type SelectItemProps = React.PropsWithChildren<{ value?: string }>;
export function SelectItem({ children, value, ...props }: SelectItemProps) {
  return <option value={value} {...props}>{children}</option>;
}
type SelectTriggerProps = React.PropsWithChildren<{ className?: string }>;
export function SelectTrigger({ children, className = '', ...props }: SelectTriggerProps) {
  return <button className={className} {...props}>{children}</button>;
}
type SelectValueProps = { placeholder?: string };
export function SelectValue({ placeholder }: SelectValueProps) {
  return <span>{placeholder ?? 'Value'}</span>;
}
