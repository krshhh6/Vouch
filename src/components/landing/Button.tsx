'use client';

import React from 'react';
import Link from 'next/link';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'small';
  href?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Button({
  variant = 'primary',
  href,
  children,
  className = '',
  ...props
}: ButtonProps) {
  let baseStyles = 'inline-flex items-center justify-center font-semibold transition-all select-none ';

  if (variant === 'primary') {
    baseStyles += 'bg-primary-600 text-white px-8 py-3 rounded-button hover:bg-primary-700 hover:shadow-lg active:scale-[0.99] text-base';
  } else if (variant === 'secondary') {
    baseStyles += 'border-2 border-primary-600 text-primary-400 px-8 py-3 rounded-button hover:bg-primary-600/10 active:scale-[0.99] text-base';
  } else if (variant === 'small') {
    baseStyles += 'bg-primary-600 text-white px-4 py-1.5 rounded-button text-sm font-medium hover:bg-primary-700 active:scale-[0.99]';
  }

  const combinedClasses = `${baseStyles} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
}
