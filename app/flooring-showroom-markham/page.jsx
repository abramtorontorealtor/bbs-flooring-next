import { flooringShowroomMarkhamData } from '@/data/landingPages';
import BrandLandingServer from '@/components/BrandLandingServer';
import { faqSchema, JsonLd } from '@/lib/schemas';

export const metadata = {
  title: flooringShowroomMarkhamData.title,
  description: flooringShowroomMarkhamData.description,
};

export default function FlooringShowroomMarkhamPage() {
  return (
    <>
      <JsonLd data={faqSchema(flooringShowroomMarkhamData.faqItems)} />
      <BrandLandingServer
        {...flooringShowroomMarkhamData}
        brandKey="showroom"
      />
    </>
  );
}
