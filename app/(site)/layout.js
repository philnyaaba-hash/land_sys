import SiteFooter from '../../components/land/site-footer';
import SiteHeader from '../../components/land/site-header';
import { LAND_SITE } from '../../lib/land-site';
import './land.css';

export const metadata = {
  title: {
    default: 'Asante Land — Verified land for sale in Ghana',
    template: '%s | Asante Land'
  },
  description: LAND_SITE.description,
  applicationName: 'Asante Land',
  openGraph: {
    title: 'Asante Land — Verified land for sale in Ghana',
    description: LAND_SITE.description,
    type: 'website',
    locale: 'en_GH'
  },
  robots: { index: true, follow: true }
};

export default function LandLayout({ children }) {
  return (
    <div className="land-site">
      <a className="ls-skip" href="#land-main">Skip to content</a>
      <SiteHeader />
      <main id="land-main">{children}</main>
      <SiteFooter />
    </div>
  );
}
