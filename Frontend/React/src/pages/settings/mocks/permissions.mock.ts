import { Role, User, Module, PermissionRow, PermissionMatrixUI } from '../types/settings.types';
import { DEFAULT_MODULES, DEFAULT_ROLES, PERMISSION_ACTIONS } from '../constants/settings.constants';

// ---- Generate 12 roles ----
export const mockRoles: Role[] = DEFAULT_ROLES.map((r) => ({
  ...r,
  assignedUsers: Math.floor(Math.random() * 30) + 1,
}));

// ---- Generate 245 users ----
const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'Robert', 'Lisa', 'Thomas', 'Karen',
                    'James', 'Mary', 'William', 'Patricia', 'Richard', 'Jennifer', 'Charles', 'Linda', 'Daniel', 'Barbara',
                    'Matthew', 'Susan', 'Anthony', 'Margaret', 'Mark', 'Dorothy', 'Donald', 'Lisa', 'Steven', 'Nancy'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Martinez', 'Hernandez',
                   'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez'];
const roles = mockRoles.map(r => r.id);

export const mockUsers: User[] = Array.from({ length: 245 }, (_, i) => {
  const firstName = firstNames[i % firstNames.length];
  const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
  return {
    id: `user-${i+1}`,
    employeeId: `EMP${String(i+1).padStart(4, '0')}`,
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`,
    username: `${firstName.toLowerCase()}${lastName.toLowerCase()}${i}`,
    roleId: roles[i % roles.length],
  };
});

// ---- Generate 18 modules with descriptions ----
const moduleDescriptions: Record<string, string> = {
  Dashboard: 'Overview and analytics',
  'Employee Management': 'Manage employee records',
  Attendance: 'Track attendance',
  Leave: 'Manage leave requests',
  Payroll: 'Payroll processing',
  Performance: 'Performance reviews',
  Recruitment: 'Hiring and onboarding',
  Training: 'Training programs',
  Reports: 'Generate reports',
  Settings: 'System settings',
  Policies: 'Company policies',
  Projects: 'Project management',
  Assets: 'Asset management',
  Documents: 'Document repository',
  Notifications: 'Alerts and notifications',
  Profile: 'User profile',
  Analytics: 'Data analytics and insights',
  Compliance: 'Regulatory compliance',
};

export const mockModules: Module[] = DEFAULT_MODULES.map((name, index) => ({
  id: `mod-${index+1}`,
  name,
  icon: 'Box',
  description: moduleDescriptions[name] || `${name} module`,
}));

// ---- Generate permission rows per module (keep generic) ----
function generateRowsForModule(moduleName: string) {
  const genericRows = [
    { id: `${moduleName.toLowerCase()}-view`, label: `View ${moduleName}`, description: `View ${moduleName} data` },
    { id: `${moduleName.toLowerCase()}-add`, label: `Add ${moduleName}`, description: `Add new ${moduleName} entries` },
    { id: `${moduleName.toLowerCase()}-edit`, label: `Edit ${moduleName}`, description: `Edit ${moduleName} entries` },
    { id: `${moduleName.toLowerCase()}-delete`, label: `Delete ${moduleName}`, description: `Delete ${moduleName} entries` },
    { id: `${moduleName.toLowerCase()}-export`, label: `Export ${moduleName}`, description: `Export ${moduleName} data` },
    { id: `${moduleName.toLowerCase()}-import`, label: `Import ${moduleName}`, description: `Import ${moduleName} data` },
    { id: `${moduleName.toLowerCase()}-approve`, label: `Approve ${moduleName}`, description: `Approve ${moduleName} entries` },
    { id: `${moduleName.toLowerCase()}-settings`, label: `Manage Settings`, description: `Configure ${moduleName} settings` },
  ];
  return genericRows;
}

// Special rows for Dashboard (more detailed)
const dashboardRows = [
  { id: 'dash-view', label: 'View Dashboard', description: 'Can view dashboard and widgets' },
  { id: 'dash-widgets', label: 'Manage Widgets', description: 'Can add, edit and manage widgets' },
  { id: 'dash-export', label: 'Export Dashboard', description: 'Can export dashboard data' },
  { id: 'dash-import', label: 'Import Dashboard', description: 'Can import dashboard configuration' },
  { id: 'dash-settings', label: 'Manage Settings', description: 'Can manage dashboard settings' },
  { id: 'dash-delete', label: 'Delete Dashboard', description: 'Can delete dashboard data' },
  { id: 'dash-approve', label: 'Approve Data', description: 'Can approve dashboard data' },
  { id: 'dash-analytics', label: 'View Analytics', description: 'Access analytics' },
];

export const mockPermissionRows: PermissionRow[] = mockModules.flatMap((mod) => {
  if (mod.name === 'Dashboard') {
    return dashboardRows.map(row => ({ ...row, moduleId: mod.id }));
  }
  return generateRowsForModule(mod.name).map(row => ({ ...row, moduleId: mod.id }));
});

// ---- Generate a random matrix ----
export function generateMockMatrix(_roleId: string, moduleId: string): PermissionMatrixUI {
  const rows = mockPermissionRows.filter(row => row.moduleId === moduleId);
  const matrix: PermissionMatrixUI = {};
  rows.forEach(row => {
    matrix[row.id] = {};
    PERMISSION_ACTIONS.forEach(action => {
      matrix[row.id][action.id] = Math.random() > 0.4;
    });
  });
  return matrix;
}

// ---- Mock permission data store ----
export const mockPermissionData: Record<string, Record<string, PermissionMatrixUI>> = {};
mockRoles.forEach(role => {
  mockPermissionData[role.id] = {};
  mockModules.forEach(mod => {
    mockPermissionData[role.id][mod.id] = generateMockMatrix(role.id, mod.id);
  });
});