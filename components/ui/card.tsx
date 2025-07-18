// Minimal Card component
import * as React from 'react'
type CardProps = React.PropsWithChildren<{ className?: string }>;
export function Card({ children, className = '', ...props }: CardProps) {
  return <div className={`bg-white rounded shadow ${className}`} {...props}>{children}</div>;
}
export function CardContent({ children, className = '', ...props }: CardProps) {
  return <div className={`p-4 ${className}`} {...props}>{children}</div>;
}
export function CardHeader({ children, className = '', ...props }: CardProps) {
  return <div className={`p-4 border-b ${className}`} {...props}>{children}</div>;
}
export function CardTitle({ children, className = '', ...props }: CardProps) {
  return <h3 className={`font-bold text-lg ${className}`} {...props}>{children}</h3>;
}
