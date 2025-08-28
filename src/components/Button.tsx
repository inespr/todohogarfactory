'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
};

export default function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  const base = 'px-4 py-2 rounded-lg font-medium transition';
  const styles =
    variant === 'primary'
      ? 'bg-orange-500 text-white hover:bg-orange-600'
      : 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}
