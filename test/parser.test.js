import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHtmlMetadata, decodeHtmlEntities, resolveUrl } from '../src/core/parser.js';

test('parseHtmlMetadata: correctly extracts all meta, og, and twitter tags', () => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>Test Page &amp; Awesome App</title>
      <meta name="description" content="This is a test description for SEO testing." />
      <meta name="author" content="Test Author" />
      <meta name="keywords" content="test, seo, tags" />
      <meta name="robots" content="index, follow" />
      <meta name="theme-color" content="#38bdf8" />
      <link rel="canonical" href="https://example.com/test-page" />
      <link rel="icon" href="/favicon.png" />
      <meta property="og:title" content="OG Test Page" />
      <meta property="og:description" content="OG Description test" />
      <meta property="og:image" content="/images/og-banner.jpg" />
      <meta property="og:site_name" content="TestSite" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@testuser" />
      <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "TestSite"
        }
      </script>
    </head>
    <body><h1>Hello</h1></body>
    </html>
  `;

  const meta = parseHtmlMetadata(html, 'https://example.com');

  assert.equal(meta.title, 'Test Page & Awesome App');
  assert.equal(meta.description, 'This is a test description for SEO testing.');
  assert.equal(meta.author, 'Test Author');
  assert.equal(meta.canonical, 'https://example.com/test-page');
  assert.equal(meta.favicon, 'https://example.com/favicon.png');
  assert.equal(meta.ogTitle, 'OG Test Page');
  assert.equal(meta.ogDescription, 'OG Description test');
  assert.equal(meta.ogImage, 'https://example.com/images/og-banner.jpg');
  assert.equal(meta.ogSiteName, 'TestSite');
  assert.equal(meta.twitterCard, 'summary_large_image');
  assert.equal(meta.twitterSite, '@testuser');
  assert.equal(meta.jsonLd.length, 1);
  assert.equal(meta.jsonLd[0].name, 'TestSite');
});

test('parseHtmlMetadata: fallback logic works when og/twitter tags are omitted', () => {
  const html = `
    <html>
      <head>
        <title>Basic Title</title>
        <meta name="description" content="Basic Description" />
      </head>
    </html>
  `;

  const meta = parseHtmlMetadata(html);
  assert.equal(meta.ogTitle, 'Basic Title');
  assert.equal(meta.ogDescription, 'Basic Description');
  assert.equal(meta.twitterTitle, 'Basic Title');
  assert.equal(meta.twitterDescription, 'Basic Description');
});

test('decodeHtmlEntities: decodes all standard symbols', () => {
  const raw = '&lt;div class=&quot;box&quot;&gt;Tom &amp; Jerry&#39;s &#x27;house&#x27;&lt;/div&gt;';
  const decoded = decodeHtmlEntities(raw);
  assert.equal(decoded, '<div class="box">Tom & Jerry\'s \'house\'</div>');
});

test('resolveUrl: handles absolute and relative URLs properly', () => {
  assert.equal(resolveUrl('/banner.png', 'https://example.com/sub/'), 'https://example.com/banner.png');
  assert.equal(resolveUrl('https://other.com/pic.jpg', 'https://example.com'), 'https://other.com/pic.jpg');
  assert.equal(resolveUrl('//cdn.example.com/pic.jpg', 'https://example.com'), 'https://cdn.example.com/pic.jpg');
});
