import { redirect } from 'next/navigation';

/** Legacy /tool listing → /tools */
export default function LegacyAllToolsPage() {
  redirect('/tools');
}
