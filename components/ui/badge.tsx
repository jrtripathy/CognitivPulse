import React from 'react';

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'secondary' | 'destructive';
};

export const Badge: React.FC<BadgeProps> = ({ children, className = '', variant = 'default', ...props }) => {
  // Add minimal variant styling for demonstration
  const variantClass =
    variant === 'secondary' ? 'bg-gray-200 text-gray-800' :
    variant === 'destructive' ? 'bg-red-500 text-white' :
    'bg-blue-500 text-white';
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${variantClass} ${className}`} {...props}>{children}</span>
  );
};

export default Badge;
