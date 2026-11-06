import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveDashboardAccess } from '../lib/dashboard-access.js';
import { canViewPanel, OFFICE_PANELS } from '../lib/office-panels.js';

test('resolves the highest-priority workspace role', () => {
  const access = resolveDashboardAccess(['RECEPTIONIST', 'OFFICE_MANAGER']);
  assert.equal(access.key, 'OFFICE_MANAGER');
  assert.equal(access.visual, 'manager');
  assert.ok(access.permissions.includes('staff.manage'));
});

test('falls back to a member with no access when no role is recognised', () => {
  const access = resolveDashboardAccess(['UNKNOWN']);
  assert.equal(access.key, '');
  assert.equal(access.label, 'Member');
  assert.deepEqual(access.permissions, []);
});

test('super administrators keep wildcard workspace access', () => {
  const access = resolveDashboardAccess(['SUPER_ADMIN']);
  assert.deepEqual(access.permissions, ['*']);
  assert.equal(access.visual, 'admin');
});

test('receptionists get visitor panels but no restricted office tools', () => {
  const user = { permissions: ['visitors.view', 'visitors.register', 'organization.view'] };
  assert.equal(canViewPanel(user, 'visitors'), true);
  assert.equal(canViewPanel(user, 'organization'), true);
  assert.equal(canViewPanel(user, 'overview'), true);
  assert.equal(canViewPanel(user, 'audit'), false);
  assert.equal(canViewPanel(user, 'finance'), false);
});

test('accounts with no office permissions see no office panels', () => {
  const user = { permissions: [] };
  for (const panel of Object.keys(OFFICE_PANELS)) {
    assert.equal(canViewPanel(user, panel), false, panel);
  }
});

test('any recognised office permission opens the overview', () => {
  assert.equal(canViewPanel({ permissions: ['field.view'] }, 'overview'), true);
  assert.equal(canViewPanel({ permissions: ['attendance.manage'] }, 'overview'), true);
});
