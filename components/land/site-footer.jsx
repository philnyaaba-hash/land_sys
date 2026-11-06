import Link from 'next/link';
import Icon from './icons';
import { LAND_SITE } from '../../lib/land-site';

export default function SiteFooter() {
  return (
    <footer className="ls-footer">
      <div className="ls-container">
        <div className="ls-footer-grid">
          <div className="ls-footer-brand">
            <strong>{LAND_SITE.storeName}</strong>
            <p>{LAND_SITE.tagline}</p>
            <p className="ls-footer-note">
              Land sales, title checks and reservations handled by {LAND_SITE.name}.
            </p>
          </div>

          <div>
            <h3>Explore</h3>
            <Link href="/listings">Land for sale</Link>
            <Link href="/how-it-works">How buying works</Link>
            <Link href="/track">Track a reservation</Link>
            <Link href="/faq">Questions</Link>
          </div>

          <div>
            <h3>Company</h3>
            <Link href="/about">About us</Link>
            <Link href="/sell">Sell your land</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/legal">Terms and privacy</Link>
          </div>

          <div>
            <h3>Talk to us</h3>
            <a href={'mailto:' + LAND_SITE.email}>
              <Icon name="mail" size={15} />
              {LAND_SITE.email}
            </a>
            {LAND_SITE.phone ? (
              <a href={'tel:' + LAND_SITE.phone.replace(/[^\d+]/g, '')}>
                <Icon name="phone" size={15} />
                {LAND_SITE.phone}
              </a>
            ) : null}
            <span className="ls-footer-static">
              <Icon name="mapPin" size={15} />
              {LAND_SITE.address}
            </span>
            <span className="ls-footer-static">
              <Icon name="clock" size={15} />
              {LAND_SITE.hours}
            </span>
          </div>
        </div>

        <div className="ls-footer-bottom">
          <span>© {new Date().getFullYear()} {LAND_SITE.name}. All rights reserved.</span>
          <div>
            <Link href="/legal">Terms</Link>
            <Link href="/legal#privacy">Privacy</Link>
            <Link href="/dashboard">Sign in</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
