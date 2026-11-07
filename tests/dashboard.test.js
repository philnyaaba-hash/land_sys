'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

test('dashboard stats API route exists', () => {
  assert.ok(fs.existsSync(path.join(ROOT, 'app', 'api', 'dashboard', 'stats', 'route.js')));
});

test('dashboard alerts API route exists', () => {
  assert.ok(fs.existsSync(path.join(ROOT, 'app', 'api', 'dashboard', 'alerts', 'route.js')));
});

test('dashboard activity API route exists', () => {
  assert.ok(fs.existsSync(path.join(ROOT, 'app', 'api', 'dashboard', 'activity', 'route.js')));
});

test('dashboard regions API route exists', () => {
  assert.ok(fs.existsSync(path.join(ROOT, 'app', 'api', 'dashboard', 'regions', 'route.js')));
});

test('dashboard visitors today API route exists', () => {
  assert.ok(fs.existsSync(path.join(ROOT, 'app', 'api', 'dashboard', 'visitors', 'today', 'route.js')));
});

test('dashboard clients API route exists', () => {
  assert.ok(fs.existsSync(path.join(ROOT, 'app', 'api', 'dashboard', 'clients', 'route.js')));
});

test('dashboard export API route exists', () => {
  assert.ok(fs.existsSync(path.join(ROOT, 'app', 'api', 'dashboard', 'export', 'route.js')));
});

test('dashboard kanban visits API route exists', () => {
  assert.ok(fs.existsSync(path.join(ROOT, 'app', 'api', 'dashboard', 'kanban', 'visits', 'route.js')));
});

test('dashboard kanban service-requests API route exists', () => {
  assert.ok(fs.existsSync(path.join(ROOT, 'app', 'api', 'dashboard', 'kanban', 'service-requests', 'route.js')));
});

test('dashboard page.js exists', () => {
  assert.ok(fs.existsSync(path.join(ROOT, 'app', 'dashboard', 'page.js')));
});

test('kpi-cards component exists', () => {
  assert.ok(fs.existsSync(path.join(ROOT, 'components', 'dashboard', 'kpi-cards.jsx')));
});

test('alerts-panel component exists', () => {
  assert.ok(fs.existsSync(path.join(ROOT, 'components', 'dashboard', 'alerts-panel.jsx')));
});

test('activity-chart component exists', () => {
  assert.ok(fs.existsSync(path.join(ROOT, 'components', 'dashboard', 'activity-chart.jsx')));
});

test('regional-breakdown component exists', () => {
  assert.ok(fs.existsSync(path.join(ROOT, 'components', 'dashboard', 'regional-breakdown.jsx')));
});

test('visitor-traffic component exists', () => {
  assert.ok(fs.existsSync(path.join(ROOT, 'components', 'dashboard', 'visitor-traffic.jsx')));
});

test('client-analytics component exists', () => {
  assert.ok(fs.existsSync(path.join(ROOT, 'components', 'dashboard', 'client-analytics.jsx')));
});

test('kanban-board component exists', () => {
  assert.ok(fs.existsSync(path.join(ROOT, 'components', 'dashboard', 'kanban-board.jsx')));
});

test('export-hub component exists', () => {
  assert.ok(fs.existsSync(path.join(ROOT, 'components', 'dashboard', 'export-hub.jsx')));
});

test('dashboard globals.css contains dashboard styles', () => {
  const css = fs.readFileSync(path.join(ROOT, 'app', 'globals.css'), 'utf8');
  assert.ok(css.includes('dashboard-layout'), 'globals.css should contain dashboard-layout styles');
  assert.ok(css.includes('kpi-card'), 'globals.css should contain kpi-card styles');
  assert.ok(css.includes('alert-item'), 'globals.css should contain alert-item styles');
  assert.ok(css.includes('activity-chart'), 'globals.css should contain activity-chart styles');
  assert.ok(css.includes('kanban'), 'globals.css should contain kanban styles');
  assert.ok(css.includes('export-item'), 'globals.css should contain export-item styles');
});
