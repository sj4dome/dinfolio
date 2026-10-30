import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyStatus, githubDraft, isAllowedPublicUrl, parseMetadata } from '../scripts/automation-core.mjs';

test('reject unsafe or private URLs', () => {
  for (const u of ['http://example.org', 'https://localhost', 'https://127.0.0.1/a', 'https://192.168.1.10', 'https://10.0.0.1', 'https://169.254.169.254', 'https://example.org@127.0.0.1', 'file:///etc/hosts']) assert.equal(isAllowedPublicUrl(u), false, u);
  assert.equal(isAllowedPublicUrl('https://example.org/projects'), true);
});
test('extract title and description from meta HTML in either attribute order', () => {
  assert.deepEqual(parseMetadata('<html><head><meta content="A &amp; B" property="og:title"><meta name="description" content="Portfolio details"><title>Ignored</title></head></html>'), { title: 'A & B', description: 'Portfolio details' });
});
test('classify link errors conservatively', () => {
  assert.equal(classifyStatus(200), 'ok');
  assert.equal(classifyStatus(302), 'ok');
  assert.equal(classifyStatus(404), 'broken');
  assert.equal(classifyStatus(403), 'unknown');
  assert.equal(classifyStatus(500), 'unknown');
});
test('GitHub import creates draft, never publishes', () => {
  const row = githubDraft({name:'my-app', owner: {login:'din'}, description:'a test', html_url:'https://github.com/din/my-app', homepage:'https://app.example.com', language:'TypeScript', topics:['react'], created_at:'2025-01-01T00:00:00Z'});
  assert.equal(row.status, 'draft');
  assert.equal(row.featured, false);
  assert.equal(row.slug, 'github-din-my-app');
  assert.equal(row.live_url, 'https://app.example.com');
});
