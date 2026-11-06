import { redirect } from 'next/navigation';
import OfficePanelView from '../../../components/office/office-panel-view';
import { currentUser } from '../../../lib/office-auth';
import { OFFICE_PANELS } from '../../../lib/office-panels';

export const metadata = { title: 'Office workspace — LandLedger' };

export default async function OfficeEmbedPage({ searchParams }) {
  const params = await searchParams;
  const panel = typeof params?.panel === 'string' && OFFICE_PANELS[params.panel] ? params.panel : 'overview';
  const user = await currentUser();
  if (!user) redirect('/office/login?next=' + encodeURIComponent('/office/embed?panel=' + panel));
  return <OfficePanelView initialUser={user} panel={panel} />;
}
