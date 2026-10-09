// src/pages/employees/utils/employees.utils.ts

export const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const generateEmployeeId = (employees: any[]): string => {
  const maxId = employees.reduce((max, emp) => {
    const num = parseInt(emp.id.replace('EMP', ''));
    return num > max ? num : max;
  }, 0);
  const nextId = maxId + 1;
  return `EMP${String(nextId).padStart(3, '0')}`;
};

export const calculateStatisticChange = (current: number, previous: number): string => {
  if (previous === 0) return '+0 this month';
  const change = current - previous;
  // const percentage = Math.round((change / previous) * 100);
  return `${change >= 0 ? '+' : ''}${change} this month`;
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    Active: '#10b981',
    Inactive: '#6b7280',
    'On Leave': '#f59e0b',
    Terminated: '#ef4444'
  };
  return colors[status] || '#6b7280';
};