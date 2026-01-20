import Link from 'next/link';
import styles from './Button.module.css';

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  type?: 'button' | 'submit';
  className?: string;
}

export default function Button({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'medium',
  type = 'button',
  className = '',
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
    <button
      type={type}
      onClick={onClick}
      className={baseClasses}
    >
      {children}
    </button>
  );
}
