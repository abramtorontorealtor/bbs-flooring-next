import AdminBookingsClient from '@/components/admin/AdminBookingsClient';

export const metadata = {
  title: 'Bookings — BBS Flooring Admin',
  robots: { index: false, follow: false },
};

export default function AdminBookingsPage() {
  return <AdminBookingsClient />;
}
