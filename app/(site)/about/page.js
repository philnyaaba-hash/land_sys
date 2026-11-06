import Image from 'next/image';
import Link from 'next/link';
import Icon from '../../../components/land/icons';
import { LAND_SITE } from '../../../lib/land-site';

export const metadata = {
  title: 'About the land company',
  description: 'Asante Land is a land-only seller and marketplace for documented plots across Ghana. Read how we review titles and handle reservations.'
};

const VALUES = [
  {
    icon: 'document',
    title: 'Paperwork before photography',
    copy: 'A listing cannot go live until the search, indenture review and boundary report are on file. Presentation comes after documentation.'
  },
  {
    icon: 'users',
    title: 'A person, not a checkout',
    copy: 'Every reservation is reviewed by a land officer. Automated emails never approve a sale or release documents.'
  },
  {
    icon: 'mapPin',
    title: 'Land only, on purpose',
    copy: 'We do not list houses, rentals or shortlets. Staying in one asset class keeps the checks and the advice honest.'
  },
  {
    icon: 'shield',
    title: 'Disclose the gaps',
    copy: 'If a title is still in progress or a document is missing, the listing says so before you reserve.'
  }
];

export default function AboutPage() {
  return (
    <>
      <section className="ls-page-head">
        <div className="ls-container ls-page-head-row">
          <div>
            <p className="ls-eyebrow">About {LAND_SITE.storeName}</p>
            <h1>A land company that leads with the file.</h1>
          </div>
          <p>
            {LAND_SITE.name} buys, documents and sells land in Ghana. The storefront exists to show buyers what is
            actually available, what the title looks like, and what the next step costs.
          </p>
        </div>
      </section>

      <section className="ls-container ls-about-split">
        <div className="ls-about-media">
          <Image src="/assets/land/hero.png" alt="Residential land development in Ghana" fill sizes="(max-width: 900px) 100vw, 50vw" className="ls-cover-image" />
        </div>
        <div className="ls-about-copy">
          <p className="ls-eyebrow">Why we exist</p>
          <h2>Buying land should not feel like a gamble.</h2>
          <p>
            Most land disputes we see start with the same missing step: nobody read the documents before money changed
            hands. A buyer is shown a plot, told the title is clean, and only later discovers a family claim, an
            overlapping survey or a seller who could not transfer.
          </p>
          <p>
            We built this storefront around a simple rule: publish the title status, keep the boundary report with the
            listing, and let a buyer ask for the document pack before paying anything. It makes the sales process slower.
            It also makes it harder to sell the same plot twice.
          </p>
          <p>
            The company’s land officers handle the transaction from first enquiry to completion. The same team that
            checked the title answers your questions about it.
          </p>
          <Link href="/how-it-works" className="ls-button ls-button-secondary">
            See the buying process
            <Icon name="arrowRight" size={15} />
          </Link>
        </div>
      </section>

      <section className="ls-section">
        <div className="ls-container">
          <div className="ls-section-head">
            <div>
              <p className="ls-eyebrow">How we work</p>
              <h2>Four rules we do not bend</h2>
            </div>
          </div>
          <div className="ls-value-grid">
            {VALUES.map((value) => (
              <article key={value.title} className="ls-value">
                <span className="ls-value-icon"><Icon name={value.icon} size={20} /></span>
                <h3>{value.title}</h3>
                <p>{value.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ls-section ls-section-tight">
        <div className="ls-container ls-split is-reverse">
          <div className="ls-split-copy">
            <p className="ls-eyebrow">The standard</p>
            <h2>What “title verified” means here</h2>
            <p>
              The badge is not a marketing label. It means the office has completed a registry search, read the
              indenture or family consent record, inspected the site and recorded the boundaries against the site plan.
            </p>
            <ul className="ls-check-list">
              <li><Icon name="check" size={15} /> Seller identity and capacity confirmed</li>
              <li><Icon name="check" size={15} /> Search report on file before publishing</li>
              <li><Icon name="check" size={15} /> Boundary walked with the surveyor</li>
              <li><Icon name="check" size={15} /> Any pending work disclosed on the listing</li>
            </ul>
            <p className="ls-fineprint">
              A verification is a document and site check, not a guarantee of value. Buyers should still take independent
              legal advice before completing a purchase.
            </p>
          </div>
          <div className="ls-split-media">
            <Image src="/assets/land/survey.png" alt="Survey equipment at a land boundary" fill sizes="(max-width: 900px) 100vw, 44vw" className="ls-cover-image" />
          </div>
        </div>
      </section>

      <section className="ls-section">
        <div className="ls-container">
          <div className="ls-cta">
            <div>
              <p className="ls-eyebrow">Work with us</p>
              <h2>Buying, selling or just checking the market?</h2>
              <p>Tell us the area and the budget. We will send the plots that fit and the documents that come with them.</p>
            </div>
            <div className="ls-cta-actions">
              <Link href="/listings" className="ls-button ls-button-light">Browse land <Icon name="arrowRight" size={15} /></Link>
              <Link href="/contact" className="ls-button ls-button-outline-light">Contact the office</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
