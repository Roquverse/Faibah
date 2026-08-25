"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <nav className={styles.navbarContainer}>
        <div className={styles.navLeft}>
          <button className={styles.hamburger} onClick={() => setIsOpen(true)}>
            <Menu size={24} color="#111" />
          </button>
          <Link href="/" className={styles.brand}>
            <img src="/logo.png" alt="Faibah" width={120} />
          </Link>
        </div>

        <div className={styles.navLinks}>
          <Link href="#product" className={styles.navLink}>Product</Link>
          <Link href="#solutions" className={styles.navLink}>Solutions</Link>
          <Link href="#how-it-works" className={styles.navLink}>How it works</Link>
          <Link href="#pricing" className={styles.navLink}>Pricing</Link>
          <Link href="#resources" className={styles.navLink}>Resources</Link>
        </div>

        <div className={styles.authGroup}>
          <Link href={`${process.env.NEXT_PUBLIC_AUTH_APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://auth.faibah.com'}/login`} className={styles.signIn}>Sign in</Link>
          <Link href={`${process.env.NEXT_PUBLIC_AUTH_APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://auth.faibah.com'}/signup`} className={styles.requestDemo}>Get started &rarr;</Link>
        </div>
      </nav>

      {/* Mobile Slide-in Menu */}
      {isOpen && (
        <div className={styles.mobileOverlay} onClick={() => setIsOpen(false)}>
          <div className={styles.mobileMenu} onClick={(e) => e.stopPropagation()}>
            <div className={styles.mobileHeader}>
              <img src="/logo.png" alt="Faibah" height={32} />
              <button onClick={() => setIsOpen(false)} className={styles.closeButton}>
                <X size={24} color="#111" />
              </button>
            </div>

            <div className={styles.mobileLinks}>
              <Link href="#product" className={styles.mobileLink} onClick={() => setIsOpen(false)}>Product</Link>
              <Link href="#solutions" className={styles.mobileLink} onClick={() => setIsOpen(false)}>Solutions</Link>
              <Link href="#how-it-works" className={styles.mobileLink} onClick={() => setIsOpen(false)}>How it works</Link>
              <Link href="#pricing" className={styles.mobileLink} onClick={() => setIsOpen(false)}>Pricing</Link>
              <Link href="#resources" className={styles.mobileLink} onClick={() => setIsOpen(false)}>Resources</Link>
            </div>

            <div className={styles.mobileFooter}>
              <Link href={`${process.env.NEXT_PUBLIC_AUTH_APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://auth.faibah.com'}/login`} className={styles.mobileSignIn} onClick={() => setIsOpen(false)}>Sign in</Link>
              <Link href={`${process.env.NEXT_PUBLIC_AUTH_APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://auth.faibah.com'}/signup`} className={styles.mobileDemo} onClick={() => setIsOpen(false)}>Get started &rarr;</Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
