import Image from 'next/image';
import Link from 'next/link';
import Icon from '../../../components/land/icons';
import { formatGhs } from '../../../lib/land-commerce';

export const metadata = {
  title: 'How buying land works',
  description: 'The LandLedger buying process: document pack, site visit, reservation, payment schedule and completion, with the checks at every stage.'
};

const STEPS = [
  {
    title: 'Shortlist and ask for the pack',
    copy: 'Choose a plot and request the document pack. You receive the title status, site plan, indenture or family consent record, and the boundary report where available.',
    detail: 'Nothing is paid at this stage.'
  },
  {
    title: 'Walk the land',
    copy: 'Book a site visit with the land officer and the surveyor. The boundary is walked against the site plan so you see exactly what you are buying.',
    detail: 'Bring the site plan and compare the pillars to the drawing.'
  },
  {
    title: 'Reserve the plot',
    copy: 'Send a reservation request through the storefront. The office reviews availability and sends payment instructions for the reservation fee.',
    detail: 'The fee is 5% of the price, minimum GH₵ 2,000, credited against the purchase price.'
  },
  {
    title: 'Confirm payment and sign',
    copy: 'Once the fee clears, the plot is held for the agreed period. The sale agreement sets the balance, the completion date and the documents to be delivered.',
    detail: 'Never pay to an account that is not confirmed in writing by the office.'
  },
  {
    title: 'Complete and take the file',
    copy: 'The balance is paid on the agreed schedule. You receive the executed documents, receipts and the transfer record for the land.',
    detail: 'Keep the full file together; it is your evidence of ownership.'
  }
];

const PAYMENTS = [
  { stage: 'Reservation', share: '5%', note: 'Holds the plot for review and is credited to the price.' },
  { stage: 'Sale agreement', share: 'Negotiated', note: 'Sets the balance, completion date and default terms.' },
  { stage: 'Completion', share: 'Balance', note: 'Paid against delivery of the transfer documents.' }
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="ls-page-head">
        <div className="ls-container ls-page-head-row">
          <div>
            <p className="ls-eyebrow">The process</p>
            <h1>From a listing to a file in your hand.</h1>
          </div>
          <p>
            Five stages, each with a document you can read before the next payment. The office moves at the speed of the
            paperwork, not the sales call.
          </p>
        </div>
      </section>

      <section className="ls-container ls-process">
        {STEPS.map((step, index) => (
          <article key={step.title} className="ls-process-step">
            <span className="ls-process-number">0{index + 1}</span>
            <div>
              <h2>{step.title}</h2>
              <p>{step.copy}</p>
              <small>{step.detail}</small>
            </div>
          </article>
        ))}
      </section>

      <section className="ls-section ls-section-tight">
        <div className="ls-container ls-split">
          <div className="ls-split-media">
            <Image src="/assets/land/gated.png" alt="Entrance to a gated land estate" fill sizes="(max-width: 900px) 100vw, 46vw" className="ls-cover-image" />
          </div>
          <div className="ls-split-copy">
            <p className="ls-eyebrow">Due diligence</p>
            <h2>What to check before you reserve</h2>
            <ul className="ls-check-list">
              <li><Icon name="check" size={15} /> The name on the title matches the seller</li>
              <li><Icon name="check" size={15} /> The site plan matches the boundary on the ground</li>
              <li><Icon name="check" size={15} /> No caveat, lien or pending litigation on the search</li>
              <li><Icon name="check" size={15} /> Family consent recorded where the land is customary</li>
              <li><Icon name="check" size={15} /> Access road and easements are documented</li>
              <li><Icon name="check" size={15} /> The payment schedule is in the sale agreement</li>
            </ul>
            <p className="ls-fineprint">
              Take independent legal advice before signing. The office can share the file with your lawyer.
            </p>
          </div>
        </div>
      </section>

      <section className="ls-section">
        <div className="ls-container">
          <div className="ls-section-head">
            <div>
              <p className="ls-eyebrow">Money</p>
              <h2>When each payment happens</h2>
            </div>
            <p className="ls-section-note">Every payment is receipted by the office.</p>
          </div>
          <div className="ls-payment-table">
            {PAYMENTS.map((row) => (
              <div key={row.stage}>
                <strong>{row.stage}</strong>
                <span className="ls-payment-share">{row.share}</span>
                <p>{row.note}</p>
              </div>
            ))}
          </div>
          <div className="ls-warning">
            <Icon name="shield" size={19} />
            <div>
              <strong>Never pay a reservation fee without written confirmation.</strong>
              <p>
                Payment instructions come from the office after review and name the company account. If anyone asks you
                to pay a personal account or sends new details by message, stop and call the office using the contact on
                this site.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="ls-section ls-section-tight">
        <div className="ls-container ls-cta">
          <div>
            <p className="ls-eyebrow">Ready when you are</p>
            <h2>Start with a plot and a question.</h2>
            <p>Reservation fees start at {formatGhs(2000)}. The document pack costs nothing to request.</p>
          </div>
          <div className="ls-cta-actions">
            <Link href="/listings" className="ls-button ls-button-light">Browse land <Icon name="arrowRight" size={15} /></Link>
            <Link href="/faq" className="ls-button ls-button-outline-light">Read the questions</Link>
          </div>
        </div>
      </section>
    </>
  );
}
