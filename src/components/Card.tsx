'use client';

import { ReactNode } from 'react';

type CardProps = { children: ReactNode; className?: string };
type CardHeaderProps = { title: string; actions?: ReactNode };
type CardBodyProps = { children: ReactNode };

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, actions }: CardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-semibold text-lg">{title}</h2>
      {actions}
    </div>
  );
}

export function CardBody({ children }: CardBodyProps) {
  return <div>{children}</div>;
}
