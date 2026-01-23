import React from 'react';
import Link from 'next/link';
import styles from './Button.module.css';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

export default function Button({
  children,
  href,
  variant = 'primary',
  size = 'medium',
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = `${styles.button} ${styles[variant]} ${styles[size]} ${className}`;

  if (href) {
    // Use regular anchor for external/mailto links
    if (href.startsWith('http') || href.startsWith('mailto:')) {
      return (
        <a href={href} className={baseClasses}>
          {children}
        </a>
      );
    }
    // Use Next.js Link for internal routes
    return (
      <Link href={href} className={baseClasses}>
        {children}
      </Link>
    );
  }

  return (
      <button className={baseClasses} {...props}>
      {children}
    </button>
  );
}
