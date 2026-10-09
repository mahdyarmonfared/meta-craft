import { URL } from 'node:url';

/**
 * Extracts metadata, Open Graph, Twitter Cards, and schema from HTML text.
 * @param {string} html Raw HTML source
 * @param {string} [baseUrl=''] Optional base URL for resolving relative links
 * @returns {object} Extracted metadata
 */
export function parseHtmlMetadata(html, baseUrl = '') {
  if (typeof html !== 'string') {
    return createEmptyMetadata();
  }

  const meta = createEmptyMetadata();

  // Extract <title>
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) {
    meta.title = decodeHtmlEntities(titleMatch[1].trim());
  }

  // Extract <meta> tags (both name and property attributes)
  const metaRegex = /<meta\s+([^>]+)>/gi;
  let match;

  while ((match = metaRegex.exec(html)) !== null) {
    const attributes = parseAttributes(match[1]);
    const name = (attributes.name || attributes.property || attributes['http-equiv'] || '').toLowerCase();
    const content = attributes.content !== undefined ? decodeHtmlEntities(attributes.content.trim()) : '';

    if (!name || !content) continue;

    // Standard meta
    if (name === 'description') meta.description = content;
    else if (name === 'keywords') meta.keywords = content;
    else if (name === 'author') meta.author = content;
    else if (name === 'robots') meta.robots = content;
    else if (name === 'viewport') meta.viewport = content;
    else if (name === 'theme-color') meta.themeColor = content;

    // Open Graph
    else if (name === 'og:title') meta.ogTitle = content;
    else if (name === 'og:description') meta.ogDescription = content;
    else if (name === 'og:image') meta.ogImage = resolveUrl(content, baseUrl);
    else if (name === 'og:url') meta.ogUrl = content;
    else if (name === 'og:type') meta.ogType = content;
    else if (name === 'og:site_name') meta.ogSiteName = content;
    else if (name === 'og:locale') meta.ogLocale = content;
    else if (name === 'og:image:alt') meta.ogImageAlt = content;
    else if (name === 'og:image:width') meta.ogImageWidth = content;
    else if (name === 'og:image:height') meta.ogImageHeight = content;

    // Twitter Cards
    else if (name === 'twitter:card') meta.twitterCard = content;
    else if (name === 'twitter:title') meta.twitterTitle = content;
    else if (name === 'twitter:description') meta.twitterDescription = content;
    else if (name === 'twitter:image') meta.twitterImage = resolveUrl(content, baseUrl);
    else if (name === 'twitter:site') meta.twitterSite = content;
    else if (name === 'twitter:creator') meta.twitterCreator = content;
    else if (name === 'twitter:image:alt') meta.twitterImageAlt = content;
  }

  // Extract <link rel="canonical">
  const canonicalMatch = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)
    || html.match(/<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i);
  if (canonicalMatch) {
    meta.canonical = resolveUrl(canonicalMatch[1].trim(), baseUrl);
  }

  // Extract Favicon
  const faviconMatch = html.match(/<link\s+[^>]*rel=["'](?:shortcut\s+)?icon["'][^>]*href=["']([^"']+)["'][^>]*>/i)
    || html.match(/<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:shortcut\s+)?icon["'][^>]*>/i);
  if (faviconMatch) {
    meta.favicon = resolveUrl(faviconMatch[1].trim(), baseUrl);
  } else if (baseUrl) {
    try {
      const u = new URL(baseUrl);
      meta.favicon = `${u.origin}/favicon.ico`;
    } catch {
      meta.favicon = '';
    }
  }

  // Extract JSON-LD structured data
  const jsonLdRegex = /<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let jsonLdMatch;
  while ((jsonLdMatch = jsonLdRegex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(jsonLdMatch[1].trim());
      meta.jsonLd.push(parsed);
    } catch {
      // Ignore invalid JSON-LD blocks
    }
  }

  // Fallbacks: if OG or Twitter values are missing, borrow from standard meta
  if (!meta.ogTitle && meta.title) meta.ogTitle = meta.title;
  if (!meta.ogDescription && meta.description) meta.ogDescription = meta.description;
  if (!meta.twitterTitle && (meta.ogTitle || meta.title)) meta.twitterTitle = meta.ogTitle || meta.title;
  if (!meta.twitterDescription && (meta.ogDescription || meta.description)) meta.twitterDescription = meta.ogDescription || meta.description;
  if (!meta.twitterImage && meta.ogImage) meta.twitterImage = meta.ogImage;
  if (!meta.canonical && baseUrl) meta.canonical = baseUrl;

  return meta;
}

/**
 * Fetches and parses metadata from an external live URL.
 * @param {string} targetUrl The URL to scrape
 * @param {object} [options]
 * @param {number} [options.timeout=8000] Timeout in milliseconds
 * @returns {Promise<object>} Extracted metadata
 */
export async function fetchUrlMetadata(targetUrl, options = {}) {
  const timeoutMs = options.timeout || 8000;
  let normalizedUrl = targetUrl.trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = 'https://' + normalizedUrl;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(normalizedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 MetaCraft/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      redirect: 'follow'
    });

    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('html') && !contentType.includes('xml')) {
      throw new Error(`Non-HTML content type received: ${contentType}`);
    }

    const html = await res.text();
    const finalUrl = res.url || normalizedUrl;
    const metadata = parseHtmlMetadata(html, finalUrl);
    metadata.fetchedUrl = finalUrl;
    metadata.statusCode = res.status;

    return metadata;
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms for ${normalizedUrl}`);
    }
    throw err;
  }
}

/**
 * Creates empty default metadata schema.
 * @returns {object}
 */
export function createEmptyMetadata() {
  return {
    title: '',
    description: '',
    keywords: '',
    author: '',
    canonical: '',
    favicon: '',
    themeColor: '#0ea5e9',
    robots: 'index, follow',
    viewport: 'width=device-width, initial-scale=1.0',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    ogImageAlt: '',
    ogImageWidth: '1200',
    ogImageHeight: '630',
    ogUrl: '',
    ogType: 'website',
    ogSiteName: '',
    ogLocale: 'en_US',
    twitterCard: 'summary_large_image',
    twitterSite: '',
    twitterCreator: '',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    twitterImageAlt: '',
    jsonLd: []
  };
}

/**
 * Parses key-value attributes from an HTML tag string.
 * @param {string} rawTagAttributes
 * @returns {Record<string, string>}
 */
function parseAttributes(rawTagAttributes) {
  const attrs = {};
  const regex = /([a-zA-Z0-9_:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let match;
  while ((match = regex.exec(rawTagAttributes)) !== null) {
    const key = match[1].toLowerCase();
    const val = match[2] ?? match[3] ?? match[4] ?? '';
    attrs[key] = val;
  }
  return attrs;
}

/**
 * Decodes common HTML entities into characters.
 * @param {string} str
 * @returns {string}
 */
export function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&nbsp;/g, ' ');
}

/**
 * Resolves a relative URL against a base URL.
 * @param {string} relative
 * @param {string} base
 * @returns {string}
 */
export function resolveUrl(relative, base) {
  if (!relative) return '';
  if (/^https?:\/\//i.test(relative)) return relative;
  if (/^\/\//.test(relative)) return 'https:' + relative;
  if (!base) return relative;
  try {
    return new URL(relative, base).href;
  } catch {
    return relative;
  }
}
