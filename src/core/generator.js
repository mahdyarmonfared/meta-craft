/**
 * Code generation engine for MetaCraft.
 * Produces standards-compliant HTML tags, Next.js metadata objects,
 * Nuxt 3 useSeoMeta composables, and JSON-LD structured schemas.
 */

/**
 * Generates standard HTML <meta> tags block.
 * @param {object} meta Metadata object
 * @returns {string} Formatted HTML snippet
 */
export function generateHtmlMeta(meta = {}) {
  const lines = [];

  // Primary HTML Metadata
  lines.push('<!-- Primary Meta Tags -->');
  if (meta.title) {
    lines.push(`<title>${escapeHtml(meta.title)}</title>`);
    lines.push(`<meta name="title" content="${escapeAttr(meta.title)}" />`);
  }
  if (meta.description) {
    lines.push(`<meta name="description" content="${escapeAttr(meta.description)}" />`);
  }
  if (meta.keywords) {
    lines.push(`<meta name="keywords" content="${escapeAttr(meta.keywords)}" />`);
  }
  if (meta.author) {
    lines.push(`<meta name="author" content="${escapeAttr(meta.author)}" />`);
  }
  if (meta.robots) {
    lines.push(`<meta name="robots" content="${escapeAttr(meta.robots)}" />`);
  }
  if (meta.viewport) {
    lines.push(`<meta name="viewport" content="${escapeAttr(meta.viewport)}" />`);
  }
  if (meta.themeColor) {
    lines.push(`<meta name="theme-color" content="${escapeAttr(meta.themeColor)}" />`);
  }
  if (meta.canonical) {
    lines.push(`<link rel="canonical" href="${escapeAttr(meta.canonical)}" />`);
  }
  if (meta.favicon) {
    lines.push(`<link rel="icon" type="image/x-icon" href="${escapeAttr(meta.favicon)}" />`);
  }

  // Open Graph / Facebook / LinkedIn
  lines.push('');
  lines.push('<!-- Open Graph / Facebook -->');
  lines.push(`<meta property="og:type" content="${escapeAttr(meta.ogType || 'website')}" />`);
  if (meta.canonical || meta.ogUrl) {
    lines.push(`<meta property="og:url" content="${escapeAttr(meta.ogUrl || meta.canonical)}" />`);
  }
  if (meta.ogTitle || meta.title) {
    lines.push(`<meta property="og:title" content="${escapeAttr(meta.ogTitle || meta.title)}" />`);
  }
  if (meta.ogDescription || meta.description) {
    lines.push(`<meta property="og:description" content="${escapeAttr(meta.ogDescription || meta.description)}" />`);
  }
  if (meta.ogImage || meta.twitterImage) {
    lines.push(`<meta property="og:image" content="${escapeAttr(meta.ogImage || meta.twitterImage)}" />`);
    if (meta.ogImageAlt) {
      lines.push(`<meta property="og:image:alt" content="${escapeAttr(meta.ogImageAlt)}" />`);
    }
    lines.push(`<meta property="og:image:width" content="${escapeAttr(meta.ogImageWidth || '1200')}" />`);
    lines.push(`<meta property="og:image:height" content="${escapeAttr(meta.ogImageHeight || '630')}" />`);
  }
  if (meta.ogSiteName) {
    lines.push(`<meta property="og:site_name" content="${escapeAttr(meta.ogSiteName)}" />`);
  }
  if (meta.ogLocale) {
    lines.push(`<meta property="og:locale" content="${escapeAttr(meta.ogLocale)}" />`);
  }

  // Twitter / X Cards
  lines.push('');
  lines.push('<!-- Twitter / X -->');
  lines.push(`<meta name="twitter:card" content="${escapeAttr(meta.twitterCard || 'summary_large_image')}" />`);
  if (meta.canonical || meta.ogUrl) {
    lines.push(`<meta name="twitter:url" content="${escapeAttr(meta.ogUrl || meta.canonical)}" />`);
  }
  if (meta.twitterTitle || meta.ogTitle || meta.title) {
    lines.push(`<meta name="twitter:title" content="${escapeAttr(meta.twitterTitle || meta.ogTitle || meta.title)}" />`);
  }
  if (meta.twitterDescription || meta.ogDescription || meta.description) {
    lines.push(`<meta name="twitter:description" content="${escapeAttr(meta.twitterDescription || meta.ogDescription || meta.description)}" />`);
  }
  if (meta.twitterImage || meta.ogImage) {
    lines.push(`<meta name="twitter:image" content="${escapeAttr(meta.twitterImage || meta.ogImage)}" />`);
    if (meta.twitterImageAlt || meta.ogImageAlt) {
      lines.push(`<meta name="twitter:image:alt" content="${escapeAttr(meta.twitterImageAlt || meta.ogImageAlt)}" />`);
    }
  }
  if (meta.twitterSite) {
    lines.push(`<meta name="twitter:site" content="${escapeAttr(meta.twitterSite)}" />`);
  }
  if (meta.twitterCreator) {
    lines.push(`<meta name="twitter:creator" content="${escapeAttr(meta.twitterCreator)}" />`);
  }

  return lines.join('\n');
}

/**
 * Generates Next.js App Router (metadata) code snippet.
 * @param {object} meta Metadata object
 * @returns {string} Next.js TypeScript / JavaScript snippet
 */
export function generateNextJsMetadata(meta = {}) {
  const title = meta.title || meta.ogTitle || '';
  const desc = meta.description || meta.ogDescription || '';
  const url = meta.canonical || meta.ogUrl || '';
  const image = meta.ogImage || meta.twitterImage || '';
  const siteName = meta.ogSiteName || '';
  const card = meta.twitterCard || 'summary_large_image';

  return `import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: ${JSON.stringify(title)},
  description: ${JSON.stringify(desc)},
  metadataBase: new URL(${JSON.stringify(url || 'https://example.com')}),
  alternates: {
    canonical: ${JSON.stringify(url || '/')},
  },
  openGraph: {
    title: ${JSON.stringify(meta.ogTitle || title)},
    description: ${JSON.stringify(meta.ogDescription || desc)},
    url: ${JSON.stringify(url || '/')},
    siteName: ${JSON.stringify(siteName)},
    images: [
      {
        url: ${JSON.stringify(image)},
        width: 1200,
        height: 630,
        alt: ${JSON.stringify(meta.ogImageAlt || title)},
      },
    ],
    locale: ${JSON.stringify(meta.ogLocale || 'en_US')},
    type: ${JSON.stringify(meta.ogType || 'website')},
  },
  twitter: {
    card: ${JSON.stringify(card)},
    title: ${JSON.stringify(meta.twitterTitle || title)},
    description: ${JSON.stringify(meta.twitterDescription || desc)},
    images: [${JSON.stringify(image)}],
    creator: ${JSON.stringify(meta.twitterCreator || undefined)},
    site: ${JSON.stringify(meta.twitterSite || undefined)},
  },
  robots: {
    index: ${!((meta.robots || '').includes('noindex'))},
    follow: ${!((meta.robots || '').includes('nofollow'))},
  },
};`;
}

/**
 * Generates Nuxt 3 / Vue 3 useSeoMeta composable snippet.
 * @param {object} meta Metadata object
 * @returns {string} Nuxt 3 composable code
 */
export function generateNuxtSeoMeta(meta = {}) {
  const title = meta.title || meta.ogTitle || '';
  const desc = meta.description || meta.ogDescription || '';
  const url = meta.canonical || meta.ogUrl || '';
  const image = meta.ogImage || meta.twitterImage || '';

  return `useSeoMeta({
  title: ${JSON.stringify(title)},
  ogTitle: ${JSON.stringify(meta.ogTitle || title)},
  description: ${JSON.stringify(desc)},
  ogDescription: ${JSON.stringify(meta.ogDescription || desc)},
  ogImage: ${JSON.stringify(image)},
  ogUrl: ${JSON.stringify(url)},
  twitterTitle: ${JSON.stringify(meta.twitterTitle || title)},
  twitterDescription: ${JSON.stringify(meta.twitterDescription || desc)},
  twitterImage: ${JSON.stringify(image)},
  twitterCard: ${JSON.stringify(meta.twitterCard || 'summary_large_image')},
});`;
}

/**
 * Generates JSON-LD schema (Structured Data).
 * @param {object} meta Metadata object
 * @returns {string} Formatted JSON-LD script block
 */
export function generateJsonLd(meta = {}) {
  const title = meta.title || meta.ogTitle || '';
  const desc = meta.description || meta.ogDescription || '';
  const url = meta.canonical || meta.ogUrl || 'https://example.com';
  const image = meta.ogImage || meta.twitterImage || '';

  const schema = {
    '@context': 'https://schema.org',
    '@type': meta.ogType === 'article' ? 'Article' : 'WebSite',
    name: meta.ogSiteName || title,
    headline: title,
    description: desc,
    url: url
  };

  if (image) {
    schema.image = image;
  }

  if (meta.author) {
    schema.author = {
      '@type': 'Person',
      name: meta.author
    };
  }

  const jsonString = JSON.stringify(schema, null, 2);

  return `<script type="application/ld+json">
${jsonString}
</script>`;
}

/**
 * Generates all formats in a unified bundle.
 * @param {object} meta
 * @returns {{ html: string, nextjs: string, nuxt: string, jsonld: string }}
 */
export function generateAllFormats(meta = {}) {
  return {
    html: generateHtmlMeta(meta),
    nextjs: generateNextJsMetadata(meta),
    nuxt: generateNuxtSeoMeta(meta),
    jsonld: generateJsonLd(meta)
  };
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttr(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
