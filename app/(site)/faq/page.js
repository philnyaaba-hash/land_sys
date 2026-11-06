import Link from 'next/link';
import Icon from '../../../components/land/icons';
import { LAND_SITE } from '../../../lib/land-site';

export const metadata = {
  title: 'Land buying questions',
  description: 'Answers about title verification, reservation fees, payments, site visits, customary land, foreign buyers and documents.'
};

const QUESTIONS = [
  {
    q: 'Is every plot verified?',
    a: 'The badge says what has been done. “Title verified” means the registry search, document review and boundary inspection are complete. A listing without the badge shows its title status, and any pending work is disclosed before you reserve.'
  },
  {
    q: 'What does the reservation fee cover?',
    a: 'It holds the plot while the office reviews your request and prepares the payment schedule. The fee is 5% of the price, minimum GH₵ 2,000, and is credited against the purchase price if the sale completes under the published terms.'
  },
  {
    q: 'Can I pay online with a card?',
    a: 'No. This website does not take card payments. After the office reviews a reservation, it sends payment instructions for bank transfer, mobile money or an office payment, and issues a receipt when the money clears.'
  },
  {
    q: 'Can I visit the land before paying?',
    a: 'Yes, and you should. Book a site visit through the enquiry form on the listing. A land officer walks the boundary with you and the surveyor against the site plan. The visit is free; the document pack is also free to request.'
  },
  {
    q: 'Which documents do I receive?',
    a: 'Depending on the listing: the search report, indenture or family consent record, site plan, boundary report, sale agreement, payment receipts and the transfer record. The listing tells you what is already on file.'
  },
  {
    q: 'What is different about customary land?',
    a: 'Customary land is held by a family or community. The transfer needs the proper consent and a witnessed record, which takes longer than a registered-title sale. We arrange the family meeting and document the consent before completion, and the listing says when the title is customary.'
  },
  {
    q: 'Can a non-Ghanaian buy?',
    a: 'Ghanaian law limits foreign ownership to leasehold interests and does not permit freehold ownership by non-citizens. The exact term and conditions depend on the land and the intended use. Take independent legal advice before reserving if you are not a Ghanaian citizen.'
  },
  {
    q: 'What if the title is still in progress?',
    a: 'It is disclosed on the listing and reflected in the reservation terms. We do not present pending work as completed. If the risk is not acceptable to you, do not reserve; the office can suggest plots with completed titles.'
  },
  {
    q: 'Can I resell the land later?',
    a: 'Resale depends on the interest you hold, the terms of your agreement and any family or assembly consent. The office can explain the process for a specific plot, but it is not legal or investment advice.'
  },
  {
    q: 'How do I raise a concern about a listing?',
    a: 'Email the office with the listing name and reference. Concerns about a boundary, a claim or a payment are reviewed by the same team that checked the title.'
  }
];

export default function FaqPage() {
  return (
    <>
      <section className="ls-page-head ls-page-head-small">
        <div className="ls-container">
          <p className="ls-eyebrow">Straight answers</p>
          <div className="ls-page-head-row">
            <h1>Land buying questions</h1>
            <p>What the title status means, what the reservation fee covers, and what happens before completion.</p>
          </div>
        </div>
      </section>

      <section className="ls-container ls-faq">
        {QUESTIONS.map((item, index) => (
          <details key={item.q} open={index === 0}>
            <summary>
              <span>{item.q}</span>
              <Icon name="chevronDown" size={18} />
            </summary>
            <p>{item.a}</p>
          </details>
        ))}
      </section>

      <section className="ls-container ls-faq-help">
        <div>
          <h2>Still unsure about something?</h2>
          <p>Send the listing name and your question. A land officer will answer with the documents in front of them.</p>
        </div>
        <div className="ls-faq-actions">
          <Link href="/contact" className="ls-button ls-button-primary">Contact the office <Icon name="arrowRight" size={15} /></Link>
          <a href={'mailto:' + LAND_SITE.email} className="ls-text-link">{LAND_SITE.email}</a>
        </div>
      </section>
    </>
  );
}
