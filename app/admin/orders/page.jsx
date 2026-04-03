import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Orders — BBS Flooring Admin',
};

export default function AdminOrdersPage() {
  redirect('/admin/crm?source=order');
}
