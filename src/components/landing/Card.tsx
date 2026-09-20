'use client';

import React from 'react';

interface CardProps {
  variant?: 'dark' | 'neutral';
  children: React.ReactNode;
  className?: string;
}

export default function Card({
  variant = 'dark',
  children,
  className = '',
}: CardProps) {
  const baseStyles =
    variant === 'dark'
      ? 'bg-navy-800 rounded-card p-6 border border-navy-700 hover:border-primary-600/50 transition-all duration-300 shadow-md'
      : 'bg-neutral-50 rounded-card p-6 border border-neutral-200 text-neutral-900 transition-all duration-300 shadow-sm';

  return (
    <div className={`${baseStyles} ${className}`.trim()}>
      {children}
    </div>
  );
}
