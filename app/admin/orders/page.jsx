import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Orders',
};

export default function AdminOrdersPage() {
  redirect('/admin/crm?source=order');
}
