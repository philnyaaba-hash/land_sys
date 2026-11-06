import Link from 'next/link';
import { LAND_SITE } from '../../../lib/land-site';

export const metadata = {
  title: 'Terms and privacy',
  description: 'Storefront terms, reservation terms, payment safety and the privacy summary for Asante Land.'
};

export default function LegalPage() {
  return (
    <>
      <section className="ls-page-head ls-page-head-small">
        <div className="ls-container">
          <p className="ls-eyebrow">The fine print, in plain language</p>
          <h1>Terms and privacy</h1>
          <p className="ls-legal-date">Last updated 6 November 2026</p>
        </div>
      </section>

      <article className="ls-container ls-legal">
        <section>
          <h2>1. This website</h2>
          <p>
            This storefront is operated by {LAND_SITE.name}. It lists land for sale and accepts reservation requests. It
            is not a payment platform, a bank, a law firm or an escrow service.
          </p>
          <p>
            Prices, sizes and title statuses are shown as accurately as the office can establish at the time of
            publishing. A listing can change or be withdrawn before a reservation is confirmed.
          </p>
        </section>

        <section>
          <h2>2. Listings and verification</h2>
          <p>
            A “Title verified” badge means the office has completed a registry search, reviewed the available title or
            consent documents, inspected the site and recorded the boundaries. It is a document and site check, not a
            guarantee of value, planning permission or freedom from future claims.
          </p>
          <p>
            Where a title is customary, pending or held under an indenture, the listing says so. Buyers should take
            independent legal advice before signing any agreement.
          </p>
        </section>

        <section>
          <h2>3. Reservations</h2>
          <p>
            A reservation request is an offer to hold a plot for review. It is not a completed sale and does not transfer
            any interest in land. The office confirms availability and sends payment instructions after review.
          </p>
          <p>
            The reservation fee is 5% of the listed price, with a minimum of GH₵ 2,000. It is credited against the
            purchase price if the sale completes under the published terms. Refunds, if any, follow the written
            reservation terms shared before payment.
          </p>
          <p>
            A reservation may be cancelled by the office if the review finds a problem with the title, the seller’s
            capacity to transfer, or the accuracy of the listing.
          </p>
        </section>

        <section>
          <h2>4. Payments and fraud</h2>
          <p>
            No card is charged on this website. Payment instructions are issued by the office after review and name the
            company account. Never pay a personal account, and never accept changed bank details sent by message without
            verifying them with the office using the contact details on this site.
          </p>
          <p>
            Always keep the office receipt. A payment without a receipt is difficult to trace and may not be credited to
            your reservation.
          </p>
        </section>

        <section id="privacy">
          <h2>5. Privacy</h2>
          <p>
            When you send an enquiry or reservation, we collect the name, email address, phone number, message and any
            listing reference you provide. We use this information only to answer your enquiry, review the reservation
            and manage the land transaction.
          </p>
          <ul>
            <li>We do not sell your details or add you to a marketing list.</li>
            <li>We share the information only with the staff and professional advisers working on the transaction.</li>
            <li>Reservation records are kept while the transaction is active and for as long as required for accounting and legal records.</li>
            <li>You can ask the office to correct your details or explain what is held about you.</li>
          </ul>
          <p>
            This storefront does not set advertising cookies. The staff workspace uses a secure session cookie after
            sign-in; that cookie is not used for tracking across other sites.
          </p>
        </section>

        <section>
          <h2>6. Liability and law</h2>
          <p>
            The website is provided as a listing and enquiry service. To the extent permitted by law, {LAND_SITE.name} is
            not liable for decisions made solely on the basis of a listing without reading the document pack and taking
            independent advice.
          </p>
          <p>These terms are governed by the laws of Ghana.</p>
        </section>

        <section>
          <h2>7. Contact</h2>
          <p>
            Questions about these terms or a transaction: <a href={'mailto:' + LAND_SITE.email}>{LAND_SITE.email}</a>.
            Office hours: {LAND_SITE.hours}.
          </p>
        </section>

        <div className="ls-legal-foot">
          <Link href="/contact" className="ls-button ls-button-secondary">Contact the office</Link>
          <Link href="/faq" className="ls-text-link">Read the buying questions</Link>
        </div>
      </article>
    </>
  );
}
