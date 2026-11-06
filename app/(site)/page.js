import Image from 'next/image';
import Link from 'next/link';
import ListingCard from '../../components/land/listing-card';
import ListingSearch from '../../components/land/listing-search';
import Icon from '../../components/land/icons';
import { formatAcres } from '../../lib/land-commerce';
import { GHANA_REGIONS } from '../../lib/ghana-regions';
import { getFeaturedListings, getLatestListings, getStorefrontTotals } from '../../lib/land-store';
import { LAND_SITE, TRUST_POINTS } from '../../lib/land-site';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Land for sale in Ghana — verified plots, clear titles',
  description: 'Browse surveyed residential, commercial and agricultural land across Ghana. Every published listing is checked before it reaches the storefront.'
};

const REGION_TILES = [
  { region: 'Greater Accra', image: '/assets/land/residential.png', copy: 'Serviced plots around Accra and the coast' },
  { region: 'Eastern', image: '/assets/land/hills.png', copy: 'Hillside and lakeside land along the ridge' },
  { region: 'Ashanti', image: '/assets/land/farmland.png', copy: 'Farmland and long-hold land around Kumasi' },
  { region: 'Central', image: '/assets/land/gated.png', copy: 'Gated layouts and growing coastal towns' }
];

export default async function LandHomePage() {
  const [featured, latest, totals] = await Promise.all([
    getFeaturedListings(3),
    getLatestListings(3),
    getStorefrontTotals()
  ]);

  return (
    <>
      <section className="ls-hero">
        <div className="ls-container ls-hero-grid">
          <div className="ls-hero-copy">
            <p className="ls-eyebrow"><span /> Land only. Nothing else.</p>
            <h1>Land you can stand on, with papers you can check.</h1>
            <p className="ls-hero-lead">
              Surveyed plots, farmland and commercial parcels across Ghana. We publish the price, the title status and
              the location before you ever speak to a salesperson.
            </p>
            <ListingSearch compact />
            <div className="ls-hero-actions">
              <Link href="/listings" className="ls-button ls-button-primary">
                Browse every plot
                <Icon name="arrowRight" size={15} />
              </Link>
              <Link href="/how-it-works" className="ls-text-link">
                How buying works
                <Icon name="arrowUpRight" size={14} />
              </Link>
            </div>
            <dl className="ls-hero-stats">
              <div><dt>Published plots</dt><dd>{totals.listings}</dd></div>
              <div><dt>Regions covered</dt><dd>{totals.regions}</dd></div>
              <div><dt>Land listed</dt><dd>{formatAcres(totals.acres)}</dd></div>
            </dl>
          </div>

          <div className="ls-hero-media">
            <Image
              src="/assets/land/hero.png"
              alt="Surveyed residential land with graded access roads in Ghana"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 52vw"
              className="ls-hero-image"
            />
            <div className="ls-hero-card">
              <span className="ls-hero-card-icon"><Icon name="shield" size={18} /></span>
              <div>
                <strong>Checked before listing</strong>
                <p>Title search, site inspection and boundary report on every published plot.</p>
              </div>
            </div>
            <div className="ls-hero-caption">
              <span>Adenta Ridge</span>
              <span>Greater Accra</span>
            </div>
          </div>
        </div>
      </section>

      <section className="ls-section ls-section-tight">
        <div className="ls-container">
          <div className="ls-section-head">
            <div>
              <p className="ls-eyebrow">Selected land</p>
              <h2>Plots worth a site visit</h2>
            </div>
            <Link href="/listings" className="ls-text-link">
              See all {totals.listings} listings
              <Icon name="arrowRight" size={14} />
            </Link>
          </div>
          <div className="ls-grid ls-grid-3">
            {featured.map((listing, index) => (
              <ListingCard key={listing.id} listing={listing} priority={index === 0} />
            ))}
          </div>
        </div>
      </section>

      <section className="ls-trust">
        <div className="ls-container ls-trust-grid">
          {TRUST_POINTS.map((point, index) => (
            <article key={point.title}>
              <span className="ls-trust-number">0{index + 1}</span>
              <h3>{point.title}</h3>
              <p>{point.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ls-section">
        <div className="ls-container">
          <div className="ls-section-head">
            <div>
              <p className="ls-eyebrow">By region</p>
              <h2>Start where you want to build</h2>
            </div>
            <p className="ls-section-note">Sixteen regions, one standard of documentation.</p>
          </div>
          <div className="ls-region-grid">
            {REGION_TILES.map((tile) => (
              <Link key={tile.region} href={'/listings?region=' + encodeURIComponent(tile.region)} className="ls-region-tile">
                <Image src={tile.image} alt="" fill sizes="(max-width: 700px) 100vw, 25vw" className="ls-region-image" />
                <span className="ls-region-shade" />
                <span className="ls-region-copy">
                  <strong>{tile.region}</strong>
                  <small>{tile.copy}</small>
                </span>
                <span className="ls-region-arrow"><Icon name="arrowUpRight" size={16} /></span>
              </Link>
            ))}
          </div>
          <div className="ls-region-links">
            {GHANA_REGIONS.filter((region) => !REGION_TILES.some((tile) => tile.region === region)).map((region) => (
              <Link key={region} href={'/listings?region=' + encodeURIComponent(region)}>{region}</Link>
            ))}
          </div>
        </div>
      </section>

      <section className="ls-section ls-diligence">
        <div className="ls-container ls-split">
          <div className="ls-split-media">
            <Image
              src="/assets/land/survey.png"
              alt="Survey equipment at a plot boundary"
              fill
              sizes="(max-width: 900px) 100vw, 46vw"
              className="ls-cover-image"
            />
            <div className="ls-split-tag">
              <Icon name="ruler" size={16} />
              <span>Every boundary is walked before it is listed</span>
            </div>
          </div>
          <div className="ls-split-copy">
            <p className="ls-eyebrow">Due diligence, not sales talk</p>
            <h2>The paperwork is the product.</h2>
            <p>
              A plot is only as good as the documents behind it. Before a listing goes live, the team searches the title,
              reads the indenture, inspects the site and records the boundaries. If a document is missing, the listing says so.
            </p>
            <ul className="ls-check-list">
              <li><Icon name="check" size={15} /> Land Commission and registry search</li>
              <li><Icon name="check" size={15} /> Indenture and site plan review</li>
              <li><Icon name="check" size={15} /> Physical boundary inspection with the surveyor</li>
              <li><Icon name="check" size={15} /> Seller identity and capacity check</li>
              <li><Icon name="check" size={15} /> Written disclosure of any pending title work</li>
            </ul>
            <Link href="/how-it-works" className="ls-button ls-button-secondary">
              Read the buying process
              <Icon name="arrowRight" size={15} />
            </Link>
          </div>
        </div>
      </section>

      <section className="ls-section ls-section-tight">
        <div className="ls-container">
          <div className="ls-section-head">
            <div>
              <p className="ls-eyebrow">New to the storefront</p>
              <h2>Recently published land</h2>
            </div>
            <Link href="/listings?sort=newest" className="ls-text-link">
              Browse new listings
              <Icon name="arrowRight" size={14} />
            </Link>
          </div>
          <div className="ls-grid ls-grid-3">
            {latest.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
          </div>
        </div>
      </section>

      <section className="ls-section">
        <div className="ls-container">
          <div className="ls-cta">
            <div>
              <p className="ls-eyebrow">For landowners</p>
              <h2>Have land with a story worth telling?</h2>
              <p>
                We list a small number of plots at a time so every seller gets a proper title review. Tell us what you
                hold, where it is, and what documents you have.
              </p>
            </div>
            <div className="ls-cta-actions">
              <Link href="/sell" className="ls-button ls-button-light">
                Submit your land
                <Icon name="arrowRight" size={15} />
              </Link>
              <a href={'mailto:' + LAND_SITE.email} className="ls-cta-email">{LAND_SITE.email}</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
