import { redirect } from 'next/navigation';

export default function UsersRedirectPage() {
  redirect('/rbac?tab=users');
}
