// app/api/faqs/route.js
// Returns hardcoded but high-quality category FAQs
// Faithful equivalent of the Base44 generateCategoryFAQs cloud function

const CATEGORY_FAQS = {
  solid_hardwood: [
    { question: "What is solid hardwood flooring?", answer: "Solid hardwood flooring is made from a single piece of natural wood, typically 3/4\" thick. It can be sanded and refinished multiple times over its lifetime, making it a long-lasting investment for Markham and GTA homes." },
    { question: "How long does solid hardwood flooring last?", answer: "With proper maintenance, solid hardwood flooring can last 50-100 years or more. The ability to sand and refinish the surface means you can restore its original beauty multiple times throughout its lifespan." },
    { question: "Can solid hardwood be installed in basements?", answer: "Solid hardwood is not recommended for below-grade areas like basements due to its sensitivity to moisture and humidity changes. For basements, engineered hardwood or waterproof vinyl is a better choice." },
    { question: "What species of solid hardwood do you carry?", answer: "We carry oak, maple, hickory, walnut, and more at our Markham showroom. Each species offers different hardness ratings (Janka scale) and natural grain patterns. Call (647) 428-1111 to check current stock." },
    { question: "How much does solid hardwood installation cost in Markham?", answer: "Solid hardwood installation in Markham typically costs $2.25-$3.50/sqft for labour, depending on the pattern and subfloor condition. Visit us for a free in-home measurement and accurate quote." },
    { question: "How do I maintain solid hardwood floors?", answer: "Sweep or vacuum regularly, clean spills immediately, use hardwood-specific cleaners, maintain indoor humidity between 35-55%, and place felt pads under furniture. Avoid excessive water when mopping." }
  ],
  engineered_hardwood: [
    { question: "What is engineered hardwood flooring?", answer: "Engineered hardwood has a real wood top layer (veneer) bonded over multiple layers of plywood or HDF core. It offers the look of solid hardwood with better dimensional stability — it handles humidity and temperature fluctuations better than solid wood." },
    { question: "Can engineered hardwood be installed in basements?", answer: "Yes! Engineered hardwood is suitable for below-grade installations when properly moisture-tested. It's a popular choice for finished basements in Markham and the GTA. Ask us about our moisture-resistant options." },
    { question: "How many times can engineered hardwood be refinished?", answer: "Depending on the veneer thickness (2mm-6mm), engineered hardwood can typically be refinished 1-3 times. Thicker veneer products allow more refinishing cycles." },
    { question: "What brands of engineered hardwood do you carry?", answer: "We carry Vidar Flooring, Triforest, and other premium brands at our Markham showroom. Visit us at 6061 Highway 7 to see samples, or call (647) 428-1111 for availability." },
    { question: "Is engineered hardwood waterproof?", answer: "Standard engineered hardwood is water-resistant but not fully waterproof. Some modern engineered products have enhanced moisture protection. For wet areas, consider our waterproof vinyl options." },
    { question: "How does engineered hardwood compare to solid hardwood in price?", answer: "Engineered hardwood typically costs $3-$8/sqft for the material, similar to solid hardwood. Installation costs are comparable at $2.25-$3.50/sqft. The main advantage is better performance in variable humidity conditions." }
  ],
  laminate: [
    { question: "What is laminate flooring?", answer: "Laminate flooring is a multi-layer synthetic product with a photographic layer that mimics wood, stone, or tile. It's topped with a protective wear layer, making it scratch and stain-resistant — perfect for high-traffic areas in Markham homes." },
    { question: "Is laminate flooring waterproof?", answer: "Traditional laminate is water-resistant but not fully waterproof. However, we carry waterproof laminate options with sealed edges that can handle wet areas better. Ask about our waterproof laminate selection." },
    { question: "How long does laminate flooring last?", answer: "Quality laminate flooring typically lasts 15-25 years with proper care. The wear layer thickness (AC rating) determines durability — we recommend AC4 or higher for residential use in busy households." },
    { question: "Can laminate be refinished?", answer: "No, laminate flooring cannot be sanded or refinished. When the surface wears through, the planks need to be replaced. This is why choosing a quality product with a thick wear layer matters." },
    { question: "What's the best laminate flooring for a busy household?", answer: "Look for laminate with an AC4 or AC5 wear rating, 12mm thickness, and attached underlayment. These features provide better durability, sound absorption, and comfort underfoot. Visit our Markham showroom to see options." },
    { question: "How much does laminate flooring cost in Markham?", answer: "Laminate flooring at BBS starts from $2.39/sqft for the material. Installation typically adds $2.00-$2.25/sqft. We offer complete packages including materials, installation, and old floor removal." }
  ],
  vinyl: [
    { question: "What is luxury vinyl plank (LVP) flooring?", answer: "Luxury vinyl plank (LVP) is a 100% waterproof flooring that realistically mimics hardwood. It consists of multiple layers including a rigid core (SPC or WPC), a high-definition print layer, and a protective wear layer — ideal for any room in your GTA home." },
    { question: "Is vinyl plank flooring truly waterproof?", answer: "Yes! Quality LVP flooring is 100% waterproof throughout its entire thickness. This makes it perfect for kitchens, bathrooms, basements, and laundry rooms in Markham homes. Standing water won't damage the planks themselves (though subfloor moisture should still be managed)." },
    { question: "What's the difference between SPC and WPC vinyl?", answer: "SPC (Stone Plastic Composite) has a rigid stone-polymer core — it's denser, more durable, and better for high-traffic areas. WPC (Wood Plastic Composite) has a wood-polymer core that's slightly softer and warmer underfoot. Both are 100% waterproof." },
    { question: "How long does vinyl plank flooring last?", answer: "Quality vinyl plank flooring lasts 20-25+ years with proper care. The wear layer thickness (12 mil for residential, 20+ mil for commercial) is the key durability factor. We carry products with up to 30-mil wear layers." },
    { question: "Can vinyl flooring go over existing floors?", answer: "Often yes, depending on the existing floor's condition and height. LVP can typically be installed over concrete, existing vinyl, and even some tile. Our team will assess your subfloor during your free in-home measurement." },
    { question: "How much does vinyl flooring cost in Markham?", answer: "Vinyl flooring at BBS starts from $2.49/sqft for the material. Installation is typically $2.00-$2.25/sqft. Call (647) 428-1111 or book a free measurement for an accurate project quote." }
  ]
};

const DEFAULT_FAQS = [
  { question: "Do you offer free measurements?", answer: "Yes! We provide free in-home measurements anywhere in Markham, Toronto, Scarborough, Richmond Hill, and Durham Region. Call (647) 428-1111 to book your appointment." },
  { question: "What brands of flooring do you carry?", answer: "We carry over 600 products from top brands including Vidar Flooring, Triforest, and many more. Visit our showroom at 6061 Highway 7, Markham to see samples." },
  { question: "Do you offer installation services?", answer: "Yes, we provide professional installation for all flooring types. Hardwood installation from $2.25/sqft, vinyl and laminate from $2.00/sqft. Free measurements included." },
  { question: "What areas do you serve?", answer: "We serve all GTA including Markham, Toronto, Scarborough, North York, Richmond Hill, Vaughan, Whitby, Oshawa, Ajax, Pickering, and surrounding areas." },
  { question: "How soon can my project start?", answer: "Most projects can start within 1-2 weeks of your free measurement. Call (647) 428-1111 to check current availability." }
];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || '';

  const faqs = CATEGORY_FAQS[category] || DEFAULT_FAQS;

  return Response.json({ success: true, faqs });
}
