export const LAND_SITE = {
  name: 'Asante Land Company',
  storeName: 'Asante Land',
  tagline: 'Verified land, sold with the paperwork in order.',
  description:
    'A land-only marketplace for surveyed, documented plots across Ghana. Every listing is checked before it is published, and every reservation is handled by a person.',
  email: process.env.NEXT_PUBLIC_LAND_EMAIL || 'sales@asanteland.example',
  phone: process.env.NEXT_PUBLIC_LAND_PHONE || '',
  address: process.env.NEXT_PUBLIC_LAND_ADDRESS || 'Accra, Ghana',
  hours: 'Monday to Friday, 8:30am – 5:00pm',
  currency: 'GHS'
};

export const TRUST_POINTS = [
  {
    title: 'Title checked before publishing',
    copy: 'Registry search, indenture review and a site inspection happen before a plot appears on the storefront.'
  },
  {
    title: 'One seller, one record',
    copy: 'The plot, seller, documents and reservation live on the same record, so nothing is sold twice.'
  },
  {
    title: 'A person handles every reservation',
    copy: 'Online reservation holds the plot for review. A land officer confirms the terms and payment before anything completes.'
  }
];
