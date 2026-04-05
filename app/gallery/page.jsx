import GalleryClient from '@/components/GalleryClient';

export const metadata = {
  title: 'Flooring Project Gallery | Markham Toronto Durham',
  description: 'Browse our portfolio of flooring and staircase projects across Markham, Toronto, and Durham. See real installations by BBS Flooring.',
  alternates: { canonical: '/gallery' },
};

export default function GalleryPage() {
  return <GalleryClient />;
}
