/**
 * SEO & Social Sharing Quality Auditor for MetaCraft.
 * Evaluates Open Graph, Twitter Cards, SERP compliance and generates 0-100 health score.
 */

/**
 * Audits a metadata object and computes scores and recommendations.
 * @param {object} meta Metadata object
 * @returns {object} Audit report with score, grade, checks, and warnings
 */
export function auditMetadata(meta = {}) {
  const checks = [];

  const title = (meta.title || meta.ogTitle || '').trim();
  const desc = (meta.description || meta.ogDescription || '').trim();
  const ogImage = (meta.ogImage || meta.twitterImage || '').trim();
  const canonical = (meta.canonical || meta.ogUrl || '').trim();
  const twitterCard = (meta.twitterCard || '').trim();
  const robots = (meta.robots || '').toLowerCase();
  const viewport = (meta.viewport || '').trim();

  // 1. Title Audit
  if (!title) {
    checks.push({
      id: 'title-missing',
      category: 'seo',
      label: 'Page Title',
      status: 'error',
      points: 0,
      maxPoints: 20,
      message: 'Missing <title> tag. Search engines and social cards require a title.',
      recommendation: 'Add a concise title between 40 and 60 characters.'
    });
  } else if (title.length < 30) {
    checks.push({
      id: 'title-short',
      category: 'seo',
      label: 'Page Title Length',
      status: 'warning',
      points: 12,
      maxPoints: 20,
      message: `Title is short (${title.length} chars). May miss key keywords.`,
      recommendation: 'Aim for 40-60 characters for optimal click-through rates.'
    });
  } else if (title.length > 60) {
    checks.push({
      id: 'title-long',
      category: 'seo',
      label: 'Page Title Length',
      status: 'warning',
      points: 14,
      maxPoints: 20,
      message: `Title is too long (${title.length} chars) and will truncate on SERP & social cards.`,
      recommendation: 'Keep title under 60 characters to avoid truncation.'
    });
  } else {
    checks.push({
      id: 'title-optimal',
      category: 'seo',
      label: 'Page Title Length',
      status: 'success',
      points: 20,
      maxPoints: 20,
      message: `Optimal title length (${title.length} characters).`,
      recommendation: 'Well-optimized for Google, Twitter, and Facebook.'
    });
  }

  // 2. Meta Description Audit
  if (!desc) {
    checks.push({
      id: 'desc-missing',
      category: 'seo',
      label: 'Meta Description',
      status: 'error',
      points: 0,
      maxPoints: 20,
      message: 'Missing meta description. Search engines will generate an arbitrary text snippet.',
      recommendation: 'Provide a compelling description between 120 and 160 characters.'
    });
  } else if (desc.length < 70) {
    checks.push({
      id: 'desc-short',
      category: 'seo',
      label: 'Meta Description Length',
      status: 'warning',
      points: 12,
      maxPoints: 20,
      message: `Description is short (${desc.length} chars).`,
      recommendation: 'Expand to 120-160 characters to capture user interest.'
    });
  } else if (desc.length > 160) {
    checks.push({
      id: 'desc-long',
      category: 'seo',
      label: 'Meta Description Length',
      status: 'warning',
      points: 14,
      maxPoints: 20,
      message: `Description exceeds 160 characters (${desc.length} chars) and will be truncated with "...".`,
      recommendation: 'Trim description to 150-160 characters for clean display.'
    });
  } else {
    checks.push({
      id: 'desc-optimal',
      category: 'seo',
      label: 'Meta Description Length',
      status: 'success',
      points: 20,
      maxPoints: 20,
      message: `Optimal description length (${desc.length} characters).`,
      recommendation: 'Perfect snippet length for search results and social embeds.'
    });
  }

  // 3. Open Graph Image
  if (!ogImage) {
    checks.push({
      id: 'og-image-missing',
      category: 'social',
      label: 'Open Graph Image (og:image)',
      status: 'error',
      points: 0,
      maxPoints: 25,
      message: 'Missing og:image! Shared links will display as plain, image-less cards with 70% lower engagement.',
      recommendation: 'Specify an absolute image URL (recommended 1200x630px, aspect ratio 1.91:1).'
    });
  } else {
    const isHttps = /^https:\/\//i.test(ogImage);
    const isAbsolute = /^https?:\/\//i.test(ogImage);

    if (!isAbsolute) {
      checks.push({
        id: 'og-image-relative',
        category: 'social',
        label: 'Open Graph Image URL',
        status: 'error',
        points: 5,
        maxPoints: 25,
        message: 'og:image is a relative path. Social scrapers require absolute URLs with scheme & domain.',
        recommendation: 'Include https://domain.com/path/to/image.png'
      });
    } else if (!isHttps) {
      checks.push({
        id: 'og-image-http',
        category: 'social',
        label: 'Open Graph Image Protocol',
        status: 'warning',
        points: 18,
        maxPoints: 25,
        message: 'og:image uses unencrypted HTTP. Some social platforms block non-HTTPS media.',
        recommendation: 'Upgrade og:image URL to secure HTTPS.'
      });
    } else {
      checks.push({
        id: 'og-image-valid',
        category: 'social',
        label: 'Open Graph Image (og:image)',
        status: 'success',
        points: 25,
        maxPoints: 25,
        message: 'Secure absolute Open Graph banner image specified.',
        recommendation: 'Ensure your image is exactly 1200x630px for sharp high-DPI rendering.'
      });
    }
  }

  // 4. Canonical URL
  if (!canonical) {
    checks.push({
      id: 'canonical-missing',
      category: 'seo',
      label: 'Canonical URL',
      status: 'warning',
      points: 0,
      maxPoints: 10,
      message: 'Missing rel="canonical" link. May cause duplicate content penalties with query parameters.',
      recommendation: 'Add <link rel="canonical" href="https://yourdomain.com/page">'
    });
  } else if (!/^https:\/\//i.test(canonical)) {
    checks.push({
      id: 'canonical-non-https',
      category: 'seo',
      label: 'Canonical URL Security',
      status: 'warning',
      points: 5,
      maxPoints: 10,
      message: 'Canonical URL does not use secure HTTPS protocol.',
      recommendation: 'Point canonical tags to the HTTPS version of your URLs.'
    });
  } else {
    checks.push({
      id: 'canonical-valid',
      category: 'seo',
      label: 'Canonical URL',
      status: 'success',
      points: 10,
      maxPoints: 10,
      message: 'Canonical URL is properly formatted with HTTPS.',
      recommendation: 'Prevents duplicate content issues across URL variants.'
    });
  }

  // 5. Twitter Card Definition
  if (!twitterCard) {
    checks.push({
      id: 'twitter-card-missing',
      category: 'social',
      label: 'Twitter Card Format',
      status: 'warning',
      points: 3,
      maxPoints: 10,
      message: 'Missing twitter:card meta tag. X/Twitter will fallback to basic summary card.',
      recommendation: 'Set twitter:card to "summary_large_image" for prominent feed placement.'
    });
  } else {
    checks.push({
      id: 'twitter-card-valid',
      category: 'social',
      label: 'Twitter Card Format',
      status: 'success',
      points: 10,
      maxPoints: 10,
      message: `Twitter Card configured as "${twitterCard}".`,
      recommendation: 'Supported by X, Slack, Discord and Telegram.'
    });
  }

  // 6. Robots & Indexing
  if (robots.includes('noindex')) {
    checks.push({
      id: 'robots-noindex',
      category: 'seo',
      label: 'Robots Directives',
      status: 'warning',
      points: 5,
      maxPoints: 10,
      message: 'Page contains "noindex" directive. Search engines will NOT index this page.',
      recommendation: 'Verify if this page is intended to be excluded from public search results.'
    });
  } else {
    checks.push({
      id: 'robots-indexed',
      category: 'seo',
      label: 'Robots Directives',
      status: 'success',
      points: 10,
      maxPoints: 10,
      message: 'Robots directive allows search engine crawlers to index and follow links.',
      recommendation: 'Standard configuration for discoverable public content.'
    });
  }

  // 7. Responsive Viewport
  if (!viewport) {
    checks.push({
      id: 'viewport-missing',
      category: 'technical',
      label: 'Mobile Viewport',
      status: 'warning',
      points: 0,
      maxPoints: 5,
      message: 'Missing mobile viewport tag. Page may fail Google Mobile-Friendly test.',
      recommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0">'
    });
  } else {
    checks.push({
      id: 'viewport-valid',
      category: 'technical',
      label: 'Mobile Viewport',
      status: 'success',
      points: 5,
      maxPoints: 5,
      message: 'Mobile viewport is configured correctly.',
      recommendation: 'Ensures proper scaling on smartphones and tablets.'
    });
  }

  // Calculate total score out of 100
  const totalPoints = checks.reduce((acc, c) => acc + c.points, 0);
  const maxPossible = checks.reduce((acc, c) => acc + c.maxPoints, 0);
  const score = Math.round((totalPoints / maxPossible) * 100);

  let grade = 'D';
  let gradeColor = '#ef4444'; // Red
  if (score >= 90) {
    grade = 'A+';
    gradeColor = '#10b981'; // Green
  } else if (score >= 80) {
    grade = 'A';
    gradeColor = '#22c55e'; // Green
  } else if (score >= 70) {
    grade = 'B';
    gradeColor = '#eab308'; // Yellow
  } else if (score >= 50) {
    grade = 'C';
    gradeColor = '#f97316'; // Orange
  }

  const passedCount = checks.filter(c => c.status === 'success').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;
  const errorCount = checks.filter(c => c.status === 'error').length;

  return {
    score,
    grade,
    gradeColor,
    passedCount,
    warningCount,
    errorCount,
    checks,
    summary: {
      titleLength: title.length,
      descLength: desc.length,
      hasOgImage: Boolean(ogImage),
      hasCanonical: Boolean(canonical),
      twitterCard: twitterCard || 'default'
    }
  };
}
