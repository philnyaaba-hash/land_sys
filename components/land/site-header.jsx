'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Icon from './icons';
import { LAND_SITE } from '../../lib/land-site';

const LINKS = [
  { href: '/listings', label: 'Browse land' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/sell', label: 'Sell land' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' }
];

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function goToSignIn() {
    setOpen(false);
    router.push('/dashboard');
  }

  return (
    <header className="ls-header">
      <div className="ls-container ls-header-inner">
        <Link href="/" className="ls-brand" aria-label={LAND_SITE.storeName + ' home'}>
          <span className="ls-brand-mark">
            <Image src="/assets/brand-logo.jpg" alt="" width={38} height={38} />
          </span>
          <span className="ls-brand-copy">
            <strong>{LAND_SITE.storeName}</strong>
            <small>Land, documented.</small>
          </span>
        </Link>

        <nav className="ls-nav" aria-label="Storefront">
          {LINKS.map((link) => {
            const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link key={link.href} href={link.href} className={active ? 'is-active' : undefined}>
                {link.label}
              </Link>
            );
          })}
          <Link href="/track" className="ls-nav-track">Track reservation</Link>
        </nav>

        <div className="ls-header-actions">
          <button type="button" className="ls-header-signin" onClick={goToSignIn} aria-label="Sign in to your LandLedger workspace">
            <Icon name="user" size={16} />
            <span>Sign in</span>
          </button>
          <Link href="/listings" className="ls-button ls-button-primary ls-header-cta">
            Find land
            <Icon name="arrowRight" size={15} />
          </Link>
          <button
            type="button"
            className="ls-menu-toggle"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="land-mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            <Icon name={open ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </div>

      <div id="land-mobile-nav" className={open ? 'ls-mobile-nav is-open' : 'ls-mobile-nav'} hidden={!open}>
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href}>{link.label}</Link>
        ))}
        <Link href="/track">Track reservation</Link>
        <button type="button" className="ls-mobile-signin" onClick={goToSignIn}>
          <Icon name="user" size={16} />
          Sign in to your workspace
        </button>
        <Link href="/listings" className="ls-button ls-button-primary">Browse every plot</Link>
      </div>
    </header>
  );
}
