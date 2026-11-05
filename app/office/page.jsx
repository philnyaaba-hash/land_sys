import { redirect } from 'next/navigation';
import OfficeDashboard from '../../components/office/office-dashboard';
import { currentUser } from '../../lib/office-auth';

export const metadata = { title: 'Office operations — LandLedger' };

export default async function OfficePage() {
  const user = await currentUser();
  if (!user) redirect('/office/login');
  return <OfficeDashboard initialUser={user} />;
}
