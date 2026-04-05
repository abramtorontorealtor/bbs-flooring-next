import AdminBlogPostsClient from '@/components/admin/AdminBlogPostsClient';

export const metadata = {
  title: 'Blog Post Management',
  robots: { index: false, follow: false },
};

export default function AdminBlogPage() {
  return <AdminBlogPostsClient />;
}
