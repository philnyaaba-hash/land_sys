'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

test('daily summary component file exists', () => {
  assert.ok(fs.existsSync(path.join(ROOT, 'components', 'reports', 'daily-summary.jsx')));
});

test('daily summary API route file exists', () => {
  assert.ok(fs.existsSync(path.join(ROOT, 'app', 'api', 'reports', 'daily-summary', 'route.js')));
});

test('seed reports script file exists', () => {
  assert.ok(fs.existsSync(path.join(ROOT, 'scripts', 'seed-reports.cjs')));
});

test('slack relay exposes daily digest event label', () => {
  const source = fs.readFileSync(path.join(ROOT, 'relay', 'slack-relay.js'), 'utf8');
  assert.ok(source.includes('dailyDigest'), 'slack-relay.js should define dailyDigest event');
  assert.ok(source.includes('deliverDailyDigest'), 'slack-relay.js should define deliverDailyDigest');
  assert.ok(source.includes('/digest'), 'slack-relay.js should expose /digest endpoint');
});

test('seed script registers db:seed-reports in package.json', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  assert.ok(pkg.scripts['db:seed-reports'], 'package.json should have db:seed-reports script');
  assert.equal(pkg.scripts['db:seed-reports'], 'node scripts/seed-reports.cjs');
});