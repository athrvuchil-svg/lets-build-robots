/** @typedef {{ robuParam?: string, robuId?: string, amazonInTag?: string, amazonUsTag?: string }} CommerceOptions */

/**
 * Add only verified referral parameters supplied at build time.
 * Empty configuration deliberately leaves the original merchant URL unchanged.
 * @param {string} rawUrl
 * @param {CommerceOptions} options
 * @returns {string}
 */
export function decorateMerchantUrl(rawUrl, options = {}) {
  if (!rawUrl) return rawUrl;
  const url = new URL(rawUrl);
  const host = url.hostname.toLowerCase();

  if ((host === 'robu.in' || host.endsWith('.robu.in')) && options.robuParam && options.robuId) {
    url.searchParams.set(options.robuParam, options.robuId);
  }
  if ((host === 'amazon.in' || host.endsWith('.amazon.in')) && options.amazonInTag) {
    url.searchParams.set('tag', options.amazonInTag);
  }
  if ((host === 'amazon.com' || host.endsWith('.amazon.com')) && options.amazonUsTag) {
    url.searchParams.set('tag', options.amazonUsTag);
  }
  return url.toString();
}

/**
 * @template {Record<string, any>} T
 * @param {T[]} catalog
 * @param {CommerceOptions} options
 * @returns {T[]}
 */
export function decorateCatalog(catalog, options = {}) {
  return catalog.map((part) => ({
    ...part,
    in: { ...part.in, url: decorateMerchantUrl(part.in.url, options) },
    us: { ...part.us, url: decorateMerchantUrl(part.us.url, options) },
  }));
}

/** @param {Record<string, string | undefined>} env @returns {CommerceOptions} */
export function commerceConfig(env = {}) {
  return {
    robuParam: env.PUBLIC_ROBU_REFERRAL_PARAM?.trim(),
    robuId: env.PUBLIC_ROBU_REFERRAL_ID?.trim(),
    amazonInTag: env.PUBLIC_AMAZON_IN_TAG?.trim(),
    amazonUsTag: env.PUBLIC_AMAZON_US_TAG?.trim(),
  };
}
