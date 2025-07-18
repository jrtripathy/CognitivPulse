import React from 'react';

type PopoverProps = { children: React.ReactNode };
export const Popover: React.FC<PopoverProps> = ({ children }) => <div>{children}</div>;

type PopoverTriggerProps = { children: React.ReactNode; asChild?: boolean };
export const PopoverTrigger: React.FC<PopoverTriggerProps> = ({ children, asChild }) =>
  asChild ? <>{children}</> : <button>{children}</button>;

type PopoverContentProps = { children: React.ReactNode; className?: string };
export const PopoverContent: React.FC<PopoverContentProps> = ({ children, className }) => <div className={className}>{children}</div>;
