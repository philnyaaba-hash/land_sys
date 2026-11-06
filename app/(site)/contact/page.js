import InquiryForm from '../../../components/land/inquiry-form';
import Icon from '../../../components/land/icons';
import { LAND_SITE } from '../../../lib/land-site';

export const metadata = {
  title: 'Contact the land office',
  description: 'Contact Asante Land about buying, selling, site visits, reservation payments or the document pack.'
};

export default function ContactPage() {
  return (
    <>
      <section className="ls-page-head">
        <div className="ls-container ls-page-head-row">
          <div>
            <p className="ls-eyebrow">Talk to a land officer</p>
            <h1>Questions are cheaper than mistakes.</h1>
          </div>
          <p>
            Ask about a title, a boundary, a payment schedule or a site visit. We reply within one business day, Monday
            to Friday.
          </p>
        </div>
      </section>

      <section className="ls-container ls-contact-layout">
        <div className="ls-contact-ways">
          <article className="ls-contact-card">
            <span className="ls-contact-icon"><Icon name="mail" size={19} /></span>
            <h2>Email</h2>
            <p>Best for document requests and reservation questions.</p>
            <a href={'mailto:' + LAND_SITE.email}>{LAND_SITE.email}</a>
          </article>
          {LAND_SITE.phone ? (
            <article className="ls-contact-card">
              <span className="ls-contact-icon"><Icon name="phone" size={19} /></span>
              <h2>Phone</h2>
              <p>Call during office hours for a quick answer.</p>
              <a href={'tel:' + LAND_SITE.phone.replace(/[^\d+]/g, '')}>{LAND_SITE.phone}</a>
            </article>
          ) : null}
          <article className="ls-contact-card">
            <span className="ls-contact-icon"><Icon name="mapPin" size={19} /></span>
            <h2>Office</h2>
            <p>Site visits and document reviews are arranged here.</p>
            <span>{LAND_SITE.address}</span>
          </article>
          <article className="ls-contact-card">
            <span className="ls-contact-icon"><Icon name="clock" size={19} /></span>
            <h2>Hours</h2>
            <p>Walk-ins are welcome but an appointment is faster.</p>
            <span>{LAND_SITE.hours}</span>
          </article>

          <div className="ls-warning is-soft">
            <Icon name="shield" size={19} />
            <div>
              <strong>Payment safety</strong>
              <p>
                Reservation instructions always come from the office after review and name the company account. Never pay
                a personal account or new details sent by message.
              </p>
            </div>
          </div>
        </div>

        <div className="ls-contact-form">
          <InquiryForm
            defaultType="GENERAL"
            heading="Send a message"
            intro="Tell us what you are looking for, or which plot you want to discuss. Include the listing name or reference if you have one."
          />
        </div>
      </section>
    </>
  );
}
