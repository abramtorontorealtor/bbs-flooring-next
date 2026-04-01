// Organized image collection from BBS Flooring project gallery
// All images migrated to cdn.bbsflooring.ca - Wix dependencies removed

const bulkStairsImages = [
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-1.webp", alt_text: "Staircase and Flooring Renovation Markham - Professional Installation" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-2.webp", alt_text: "Hardwood Stair Refinishing with Flooring Renovation Toronto GTA" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-3.webp", alt_text: "Stair Recapping and Flooring Installation Durham Ontario" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-4.webp", alt_text: "Premium Hardwood Staircase Refinishing Markham - Custom Design" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-5.webp", alt_text: "Vinyl Stair Treads Installation with Hardwood Floor Toronto" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-6.webp", alt_text: "Luxury Vinyl Plank (LVP) Stair Installation Markham GTA" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-7.webp", alt_text: "Iron Picket Staircase with Hardwood Stair Nosing Toronto" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-8.webp", alt_text: "Stair Refinishing with White Risers and Dark Treads Durham" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-9.webp", alt_text: "Custom Staircase Renovation with Laminate Flooring Markham" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-10.webp", alt_text: "Engineered Hardwood Stair Installation Toronto GTA Professional" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-11.webp", alt_text: "Walnut Stain Staircase with Matching Flooring Durham Ontario" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-12.webp", alt_text: "Hardwood Stair Nosing Installation Markham - Premium Finish" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-13.webp", alt_text: "Vinyl Plank Flooring with Stair Refinishing Toronto Professional" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-14.webp", alt_text: "Stair Recapping and Flooring Installation Durham GTA" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-15.webp", alt_text: "Laminate Staircase Renovation with Flooring Markham Ontario" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-16.webp", alt_text: "Hardwood Stair Installation with White Risers Toronto" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-17.webp", alt_text: "Luxury Vinyl Plank Staircase Installation Durham Professional" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-18.webp", alt_text: "Stair Refinishing with Dark Stain and Flooring Markham" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-19.webp", alt_text: "Hardwood Stair Treads Installation GTA - Premium Quality" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-20.webp", alt_text: "Vinyl Stair Treads with Hardwood Floor Installation Toronto" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-21.webp", alt_text: "Stair Recapping with Iron Pickets Durham GTA" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-22.webp", alt_text: "Engineered Hardwood Staircase Renovation Markham Ontario" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-23.webp", alt_text: "Hardwood Stair Installation with Nosing Toronto Professional" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-24.webp", alt_text: "Luxury Vinyl Plank (LVP) Flooring with Stair Renovation" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-25.webp", alt_text: "Stair Refinishing and Flooring Installation Markham GTA" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-26.webp", alt_text: "Hardwood Stair Nosing Installation Durham Ontario Professional" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-27.webp", alt_text: "Staircase Renovation with Vinyl Flooring Toronto GTA" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-28.webp", alt_text: "Custom Stair Recapping with Iron Pickets Markham" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-29.webp", alt_text: "Hardwood Staircase with White Risers Installation Toronto" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-30.webp", alt_text: "Luxury Vinyl Plank Installation with Stair Refinishing Durham" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-31.webp", alt_text: "Stair Refinishing with Vinyl Treads Markham GTA" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-32.webp", alt_text: "Hardwood Staircase Renovation and Flooring Installation" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-33.webp", alt_text: "Stair Recapping with Iron Picket Installation Toronto" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-34.webp", alt_text: "Luxury Vinyl Plank (LVP) Staircase and Floor Markham" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-35.webp", alt_text: "Engineered Hardwood Stair Installation with Flooring Durham" }
];

const bulkFlooringImages = [
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/flooring-project-1.webp", alt_text: "Durable Laminate Flooring Installation Toronto - Modern Home Renovation" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/flooring-project-2.webp", alt_text: "Professional Laminate Hallway Flooring Markham - Affordable Floor Installation" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/flooring-project-3.webp", alt_text: "Espresso Laminate Hallway Renovation GTA - Wood-Look Flooring Installation" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/flooring-project-4.webp", alt_text: "Rich Espresso Laminate Floor Installation Durham Ontario - Modern Design" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/flooring-project-5.webp", alt_text: "Laminate Flooring Renovation Project Markham - BBS Flooring Installation" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/flooring-project-6.webp", alt_text: "Natural Maple Wood-Look Laminate Flooring Installation - Toronto Residential" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/flooring-project-7.webp", alt_text: "Contemporary Hallway Flooring Installation GTA - Professional Floor Renovation" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/flooring-project-8.webp", alt_text: "Quality Flooring Installation Project Durham - Detailed Floor Craftsmanship" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/flooring-project-9.webp", alt_text: "Multi-Room Flooring Renovation Toronto - Seamless Floor Installation" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/flooring-project-10.webp", alt_text: "High-Gloss Finished Flooring Installation Markham - Premium Floor Quality" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/flooring-project-11.webp", alt_text: "Professional Hallway Flooring Project GTA - Expert Installation Services" }
];

export const stairsImages = [
  ...bulkStairsImages,
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-36.webp", alt: "White Riser Hardwood Staircase Renovation Toronto" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-37.webp", alt: "Premium Oak Hardwood Stair Installation Markham Ontario" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-38.webp", alt: "Hardwood Stair Treads and Risers Installation Markham GTA" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-39.webp", alt: "Dark Stain Hardwood Staircase Durham Ontario" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-40.webp", alt: "Dark-Stained Hardwood Stairs Toronto Home Renovation" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-41.webp", alt: "Custom Hardwood Staircase Installation GTA" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-42.webp", alt: "Professional Hardwood Staircase Installation Toronto" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-43.webp", alt: "Natural Oak Stair Renovation Markham" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-44.webp", alt: "Hardwood Stair Nosing and Trim Details" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-45.webp", alt: "Natural Hardwood Staircase Leading to Second Floor" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-46.webp", alt: "Cherry Stain Hardwood Staircase Durham" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/stair-project-47.webp", alt: "Refinished Hardwood Staircase with White Risers" }
];

export const flooringImages = [
  ...bulkFlooringImages
];

export const commercialImages = [
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/commercial-project-1.webp", alt: "Heavy Duty Commercial Vinyl Flooring Markham" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/commercial-project-2.webp", alt: "Industrial Grade Office Flooring Toronto" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/commercial-project-3.webp", alt: "Industrial Grade Laminate Flooring Retail Toronto" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/commercial-project-4.webp", alt: "Commercial Flooring Contractor GTA" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/commercial-project-5.webp", alt: "Commercial Grade Gym Flooring Installation Markham" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/commercial-project-6.webp", alt: "Commercial Flooring Contractor Toronto" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/commercial-project-7.webp", alt: "Professional Commercial Vinyl Flooring Toronto" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/commercial-project-8.webp", alt: "Commercial Office Building Flooring Markham" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/commercial-project-9.webp", alt: "Heavy Traffic Commercial Flooring Toronto" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/commercial-project-10.webp", alt: "Commercial Contractor GTA" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/commercial-project-11.webp", alt: "Industrial Commercial Flooring Markham" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/commercial-project-12.webp", alt: "Commercial Grade Flooring Solution Toronto" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/commercial-project-13.webp", alt: "Commercial Flooring Contractor Durham" },
  { url: "https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery/commercial-project-14.webp", alt: "Commercial Flooring Installation GTA" }
];

export const recentProjectsShowcase = [
  flooringImages[0],
  stairsImages[0],
  flooringImages[5],
  stairsImages[2],
  flooringImages[3],
  stairsImages[4],
  commercialImages[0],
  flooringImages[8],
];
