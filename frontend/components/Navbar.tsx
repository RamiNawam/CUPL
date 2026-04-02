'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // <-- Added import
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
    { href: '/standings', label: 'Standings' },
    { href: '/sponsors', label: 'Sponsors' },
    { href: '/about', label: 'About' },
  ];

  // Add role-specific links
  let navLinks = baseNavLinks;
  if (isAdmin) {
    navLinks = [
      ...baseNavLinks,
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
        {/* Updated Logo Link */}
        {/* Updated Circular Logo Link */}
        <Link href="/" className={styles.logoContainer}>
          <Image 
            src="/Logo-black.png" 
            alt="CUPL Logo" 
            width={150}     /* Keep width and height equal */
            height={150}    
            quality={100}
            priority        
            className={styles.logoImage} /* Added this new class */
          />
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
