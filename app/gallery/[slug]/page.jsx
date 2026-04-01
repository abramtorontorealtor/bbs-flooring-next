import { Suspense } from 'react';
import ProjectDetailClient from '@/components/ProjectDetailClient';

export function generateMetadata({ params }) {
  return {
    title: `Project Gallery | BBS Flooring`,
    description: 'View our flooring project portfolio. Professional installation by BBS Flooring in Markham and the GTA.',
  };
}

export default function ProjectDetailPage({ params }) {
  return <Suspense><ProjectDetailClient slug={params.slug} /></Suspense>;
}
