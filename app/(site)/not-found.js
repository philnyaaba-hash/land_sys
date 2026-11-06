import Link from 'next/link';
import Icon from '../../components/land/icons';

export default function LandNotFound() {
  return (
    <section className="ls-container ls-standalone">
      <span className="ls-empty-icon"><Icon name="mapPin" size={24} /></span>
      <p className="ls-eyebrow">404</p>
      <h1>This plot is not on the storefront.</h1>
      <p>The listing may have been sold, withdrawn or renamed. Browse the current land list or tell us what you are looking for.</p>
      <div className="ls-standalone-actions">
        <Link href="/listings" className="ls-button ls-button-primary">Browse land</Link>
        <Link href="/contact" className="ls-button ls-button-secondary">Contact the office</Link>
      </div>
    </section>
  );
}
