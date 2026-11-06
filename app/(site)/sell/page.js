import Image from 'next/image';
import InquiryForm from '../../../components/land/inquiry-form';
import Icon from '../../../components/land/icons';
import { LAND_SITE } from '../../../lib/land-site';

export const metadata = {
  title: 'Sell your land',
  description: 'Submit land for sale to Asante Land. We review the title, inspect the site and publish only documented plots.'
};

export default function SellPage() {
  return (
    <>
      <section className="ls-page-head">
        <div className="ls-container ls-page-head-row">
          <div>
            <p className="ls-eyebrow">For landowners</p>
            <h1>Sell land without guessing at the paperwork.</h1>
          </div>
          <p>
            We take on a small number of listings at a time. Each one gets a title review and a site inspection before it
            reaches the storefront, so buyers arrive already trusting the file.
          </p>
        </div>
      </section>

      <section className="ls-container ls-sell-layout">
        <div className="ls-sell-main">
          <div className="ls-panel">
            <div className="ls-panel-head">
              <span className="ls-panel-icon"><Icon name="document" size={19} /></span>
              <div>
                <h2>What to send us</h2>
                <p>The more of this you have, the faster the review. Missing documents are not automatically a problem.</p>
              </div>
            </div>
            <ul className="ls-check-list">
              <li><Icon name="check" size={15} /> Title document, indenture or family consent record</li>
              <li><Icon name="check" size={15} /> Site plan and any survey report</li>
              <li><Icon name="check" size={15} /> Your ID and proof that you can transfer the land</li>
              <li><Icon name="check" size={15} /> Location, size in acres and asking price</li>
              <li><Icon name="check" size={15} /> Photos of the land and the access road</li>
              <li><Icon name="check" size={15} /> Any known disputes, caveats or pending claims</li>
            </ul>
          </div>

          <div className="ls-panel">
            <h2>How the review runs</h2>
            <ol className="ls-numbered">
              <li><strong>Initial check.</strong> We confirm the location, the size and whether the documents you hold can support a sale.</li>
              <li><strong>Search and inspection.</strong> A land officer searches the title and visits the site with a surveyor.</li>
              <li><strong>Listing decision.</strong> If the file is clean, we agree a price and publish. If it is not, we tell you what is missing.</li>
              <li><strong>Buyer and reservation.</strong> We handle enquiries, site visits and reservations, and keep you updated.</li>
              <li><strong>Completion.</strong> The sale documents and transfer are prepared and executed.</li>
            </ol>
            <p className="ls-fineprint">
              Listing is at the company’s discretion. We do not charge a listing fee; our fee is agreed in writing before
              publication.
            </p>
          </div>

          <div className="ls-panel" id="submit">
            <InquiryForm
              defaultType="SELLING"
              heading="Tell us about your land"
              intro="Share the location, size, asking price and which documents you hold. A land officer will reply within one business day."
            />
          </div>
        </div>

        <aside className="ls-sell-aside">
          <div className="ls-sell-media">
            <Image src="/assets/land/farmland.png" alt="Farmland in Ghana" fill sizes="(max-width: 900px) 100vw, 32vw" className="ls-cover-image" />
          </div>
          <div className="ls-aside-help">
            <h3>What we do not take on</h3>
            <ul className="ls-check-list is-compact">
              <li><Icon name="close" size={13} /> Land with an undisclosed dispute</li>
              <li><Icon name="close" size={13} /> Sellers who cannot prove capacity to transfer</li>
              <li><Icon name="close" size={13} /> Listings that require hiding the title status</li>
            </ul>
            <p>Questions? <a href={'mailto:' + LAND_SITE.email}>{LAND_SITE.email}</a></p>
            <p>{LAND_SITE.hours}</p>
          </div>
        </aside>
      </section>
    </>
  );
}
