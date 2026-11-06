export const OFFICE_PANELS = {
  overview: { label: 'Office overview', permissions: [] },
  visitors: { label: 'Visitor operations', permissions: ['visitors.view'] },
  verify: { label: 'Access verification', permissions: ['visitors.view', 'visitors.checkin', 'visitors.card.print'] },
  staff: { label: 'Staff directory', permissions: ['staff.view'] },
  attendance: { label: 'Attendance', permissions: [] },
  organization: { label: 'Departments & rooms', permissions: ['organization.view', 'departments.manage', 'rooms.manage'] },
  reports: { label: 'Visitor reports', permissions: ['reports.view'] },
  finance: { label: 'Finance desk', permissions: ['finance.view'] },
  survey: { label: 'Surveying', permissions: ['field.view'] },
  roles: { label: 'Roles & security', permissions: ['roles.manage'] },
  audit: { label: 'Audit history', permissions: ['audit.view'] },
  settings: { label: 'Settings', permissions: ['settings.manage', 'cards.configure', 'notifications.manage'] }
};

export function canViewPanel(user, panel) {
  const def = OFFICE_PANELS[panel];
  if (!def) return false;
  if (!def.permissions.length) return true;
  return def.permissions.some((permission) => user.permissions.includes(permission));
}
