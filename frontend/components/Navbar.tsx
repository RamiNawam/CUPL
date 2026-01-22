'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import SignInModal from './SignInModal';
import Button from './Button';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout, isAuthenticated, isAdmin, isClub } = useAuth();

  const baseNavLinks = [
    { href: '/', label: 'Home' },
    { href: '/events', label: 'Events' },
    { href: '/sponsors', label: 'Sponsors' },
    { href: '/about', label: 'About/Contact' },
  ];

  // Add role-specific links
  let navLinks = baseNavLinks;
  if (isAdmin) {
    navLinks = [
      ...baseNavLinks,
      { href: '/create-event', label: 'Create Event' },
      { href: '/create-club', label: 'Create Club Account' },
    ];
  } else if (isClub) {
    navLinks = [
      ...baseNavLinks,
      { href: '/manage-club', label: 'Manage Club' },
    ];
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          CUPL
        </Link>
        
        <button
          className={styles.menuButton}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <span className={isOpen ? styles.open : ''}></span>
          <span className={isOpen ? styles.open : ''}></span>
          <span className={isOpen ? styles.open : ''}></span>
        </button>

        <ul className={`${styles.navLinks} ${isOpen ? styles.open : ''}`}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={pathname === link.href ? styles.active : ''}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className={styles.authSection}>
            {isAuthenticated ? (
              <div className={styles.userInfo}>
                <span className={styles.userEmail}>{user?.email}</span>
                <Button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  variant="outline"
                  size="small"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => {
                  setIsSignInOpen(true);
                  setIsOpen(false);
                }}
                variant="primary"
                size="small"
              >
                Sign In
              </Button>
            )}
          </li>
        </ul>
      </div>
      <SignInModal isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
    </nav>
  );
}
