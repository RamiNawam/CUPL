import type { CSSProperties } from 'react';
import styles from './Section.module.css';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  style?: CSSProperties;
}

export default function Section({ children, className = '', id, style }: SectionProps) {
  return (
    <section id={id} className={`${styles.section} ${className}`} style={style}>
      <div className={styles.container}>
        {children}
      </div>
    </section>
  );
}
