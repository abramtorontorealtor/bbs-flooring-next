import { redirect } from 'next/navigation';

// Bookings are now managed in the CRM
export default function AdminBookingsRedirect() {
  redirect('/admin?tab=crm&source=booking');
}
