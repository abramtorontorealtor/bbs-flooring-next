/**
 * Shared constants for all service/installation pages.
 * Update these once — reflected everywhere.
 */

export const GOOGLE_RATING = '4.8';
export const GOOGLE_REVIEW_COUNT = 54;
// Google Business Profile — pulled from GBP API metadata (locations/17267219491889966789), Sep 12 2026.
// ONE listing. Never hand-type a maps URL / CID / g.page link anywhere else — import these.
export const GOOGLE_PLACE_ID = 'ChIJudkRlfvW1IkRYmmY_4OX6Dg';
export const GOOGLE_MAPS_CID = '4100694053905525090';
export const GOOGLE_MAPS_URL = `https://maps.google.com/maps?cid=${GOOGLE_MAPS_CID}`;                       // the listing (directions / map)
export const GOOGLE_REVIEWS_URL = `https://search.google.com/local/reviews?placeid=${GOOGLE_PLACE_ID}`;      // "see all reviews"
export const GOOGLE_WRITE_REVIEW_URL = `https://search.google.com/local/writereview?placeid=${GOOGLE_PLACE_ID}`; // "leave a review"
export const PHONE_NUMBER = '6474281111';
export const PHONE_DISPLAY = '(647) 428-1111';
export const PHONE_HREF = 'tel:6474281111';
export const CDN_GALLERY = 'https://cdn.bbsflooring.ca/storage/v1/object/public/blog-images/gallery';

export const SERVICE_AREAS = [
  'Markham', 'Toronto', 'Scarborough', 'Richmond Hill', 'Vaughan',
  'Pickering', 'Ajax', 'Whitby', 'Oshawa', 'Stouffville',
  'Newmarket', 'Aurora', 'Mississauga', 'Brampton', 'North York',
];
