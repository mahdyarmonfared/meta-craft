import test from 'node:test';
import assert from 'node:assert/strict';
import { startServer } from '../src/server/index.js';

test('server: starts and handles all API endpoints and static serving', async () => {
  const instance = await startServer({ port: 3045 });
  const baseUrl = `http://localhost:${instance.port}`;

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/api/health`);
    assert.equal(healthRes.status, 200);
    const healthData = await healthRes.json();
    assert.equal(healthData.status, 'ok');
    assert.equal(healthData.name, 'meta-craft');

    // 2. Presets API
    const presetsRes = await fetch(`${baseUrl}/api/presets`);
    assert.equal(presetsRes.status, 200);
    const presetsData = await presetsRes.json();
    assert.ok(presetsData.presets.saas);

    // 3. Single Preset API
    const saasRes = await fetch(`${baseUrl}/api/presets/saas`);
    assert.equal(saasRes.status, 200);
    const saasData = await saasRes.json();
    assert.equal(saasData.preset.id, 'saas');

    // 4. Audit API
    const auditRes = await fetch(`${baseUrl}/api/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        meta: {
          title: 'Testing API Server Title',
          description: 'Testing description with optimal character count for our test suite assertions.',
          ogImage: 'https://example.com/banner.png'
        }
      })
    });
    assert.equal(auditRes.status, 200);
    const auditData = await auditRes.json();
    assert.ok(auditData.audit.score > 0);

    // 5. Generate API
    const genRes = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        meta: { title: 'App Name', description: 'App Desc' }
      })
    });
    assert.equal(genRes.status, 200);
    const genData = await genRes.json();
    assert.ok(genData.formats.html);
    assert.ok(genData.formats.nextjs);

    // 6. Static Web Studio HTML
    const webRes = await fetch(`${baseUrl}/`);
    assert.equal(webRes.status, 200);
    const webHtml = await webRes.text();
    assert.ok(webHtml.includes('MetaCraft'));
    assert.ok(webHtml.includes('Port 3018'));
  } finally {
    await instance.close();
  }
});
