import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateHtmlMeta,
  generateNextJsMetadata,
  generateNuxtSeoMeta,
  generateJsonLd,
  generateAllFormats
} from '../src/core/generator.js';

test('generateHtmlMeta: produces valid HTML tags with properly escaped attributes', () => {
  const meta = {
    title: 'Hello "World" & Friends',
    description: 'An awesome description with special <characters>',
    ogImage: 'https://example.com/banner.png',
    canonical: 'https://example.com/page',
    twitterCard: 'summary_large_image'
  };

  const html = generateHtmlMeta(meta);

  assert.ok(html.includes('<title>Hello "World" &amp; Friends</title>'));
  assert.ok(html.includes('<meta name="title" content="Hello &quot;World&quot; &amp; Friends" />'));
  assert.ok(html.includes('<meta property="og:image" content="https://example.com/banner.png" />'));
  assert.ok(html.includes('<meta name="twitter:card" content="summary_large_image" />'));
  assert.ok(html.includes('<link rel="canonical" href="https://example.com/page" />'));
});

test('generateNextJsMetadata: generates Next.js App Router metadata object', () => {
  const meta = {
    title: 'Next App',
    description: 'Next App Desc',
    canonical: 'https://myapp.com',
    ogImage: 'https://myapp.com/og.png'
  };

  const code = generateNextJsMetadata(meta);

  assert.ok(code.includes('import type { Metadata } from \'next\';'));
  assert.ok(code.includes('title: "Next App"'));
  assert.ok(code.includes('description: "Next App Desc"'));
  assert.ok(code.includes('openGraph: {'));
});

test('generateNuxtSeoMeta: produces useSeoMeta composable', () => {
  const meta = {
    title: 'Nuxt App',
    description: 'Nuxt Description',
    canonical: 'https://nuxt.dev'
  };

  const code = generateNuxtSeoMeta(meta);

  assert.ok(code.includes('useSeoMeta({'));
  assert.ok(code.includes('title: "Nuxt App"'));
});

test('generateJsonLd: generates valid JSON-LD script tag', () => {
  const meta = {
    title: 'JSON-LD Test',
    description: 'Structured Data Test',
    canonical: 'https://schema.test',
    author: 'Test Person'
  };

  const script = generateJsonLd(meta);

  assert.ok(script.startsWith('<script type="application/ld+json">'));
  assert.ok(script.endsWith('</script>'));

  const jsonContent = script.replace(/<script[^>]*>|<\/script>/g, '').trim();
  const parsed = JSON.parse(jsonContent);

  assert.equal(parsed['@context'], 'https://schema.org');
  assert.equal(parsed['@type'], 'WebSite');
  assert.equal(parsed.author.name, 'Test Person');
});

test('generateAllFormats: returns bundle of all 4 formats', () => {
  const bundle = generateAllFormats({ title: 'Universal Title' });

  assert.ok(bundle.html);
  assert.ok(bundle.nextjs);
  assert.ok(bundle.nuxt);
  assert.ok(bundle.jsonld);
});
