/**
 * Generates a resized Wix image URL
 * @param {string} srcUrl - Original Wix image URL
 * @param {number} width - Desired width
 * @returns {string} Optimized Wix image URL
 */
export function getWixImageUrl(srcUrl, width = 600) {
  if (!srcUrl || !srcUrl.includes('static.wixstatic.com')) {
    return srcUrl;
  }
  const baseUrl = srcUrl.split('/v1/')[0].split('?')[0];
  return `${baseUrl}/v1/fill/w_${width},h_${width},al_c,q_85,usm_0.66_1.00_0.01/file.webp`;
}

/**
 * Generates responsive srcset for Wix static images
 * @param {string} srcUrl - Original Wix image URL
 * @returns {string} srcset string with 640w, 1080w, 1920w variants
 */
export function getWixSrcSet(srcUrl) {
  if (!srcUrl || !srcUrl.includes('static.wixstatic.com')) {
    return '';
  }
  const baseUrl = srcUrl.split('/v1/')[0].split('?')[0];
  const createUrl = (width) =>
    `${baseUrl}/v1/fill/w_${width},h_${width},al_c,q_85,usm_0.66_1.00_0.01/file.webp`;
  return `${createUrl(640)} 640w, ${createUrl(1080)} 1080w, ${createUrl(1920)} 1920w`;
}
