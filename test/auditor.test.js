import test from 'node:test';
import assert from 'node:assert/strict';
import { auditMetadata } from '../src/core/auditor.js';

test('auditMetadata: high score for well-configured metadata', () => {
  const meta = {
    title: 'MetaCraft — Social Preview Studio & Meta Tag Generator',
    description: 'Pixel-perfect live social preview simulator for Twitter, Facebook, LinkedIn, Google SERP and instant Next.js meta tag generation.',
    ogImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200',
    canonical: 'https://example.com/meta-craft',
    twitterCard: 'summary_large_image',
    robots: 'index, follow',
    viewport: 'width=device-width, initial-scale=1.0'
  };

  const audit = auditMetadata(meta);

  assert.ok(audit.score >= 90, `Expected score >= 90, got ${audit.score}`);
  assert.equal(audit.grade, 'A+');
  assert.equal(audit.errorCount, 0);
  assert.ok(audit.passedCount >= 6);
});

test('auditMetadata: flags missing title and description', () => {
  const meta = {};
  const audit = auditMetadata(meta);

  assert.ok(audit.score < 50, `Expected score < 50 for empty metadata, got ${audit.score}`);
  assert.ok(audit.errorCount >= 2);

  const titleCheck = audit.checks.find(c => c.id === 'title-missing');
  const descCheck = audit.checks.find(c => c.id === 'desc-missing');
  const imgCheck = audit.checks.find(c => c.id === 'og-image-missing');

  assert.ok(titleCheck, 'Should have title-missing check');
  assert.ok(descCheck, 'Should have desc-missing check');
  assert.ok(imgCheck, 'Should have og-image-missing check');
});

test('auditMetadata: flags too short and too long titles', () => {
  const shortTitleAudit = auditMetadata({ title: 'Short' });
  const shortCheck = shortTitleAudit.checks.find(c => c.id === 'title-short');
  assert.ok(shortCheck, 'Should warn on short title');

  const longTitle = 'This is an excessively long title that will surely get truncated on social media platforms and Google SERP snippets because it exceeds sixty characters';
  const longTitleAudit = auditMetadata({ title: longTitle });
  const longCheck = longTitleAudit.checks.find(c => c.id === 'title-long');
  assert.ok(longCheck, 'Should warn on long title');
});

test('auditMetadata: warns on HTTP or relative image URL', () => {
  const relativeAudit = auditMetadata({ ogImage: '/relative/path.jpg' });
  const relativeCheck = relativeAudit.checks.find(c => c.id === 'og-image-relative');
  assert.ok(relativeCheck);

  const httpAudit = auditMetadata({ ogImage: 'http://example.com/image.jpg' });
  const httpCheck = httpAudit.checks.find(c => c.id === 'og-image-http');
  assert.ok(httpCheck);
});
