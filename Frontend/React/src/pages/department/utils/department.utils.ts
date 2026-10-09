export const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'status-badge--active';
    case 'inactive':
      return 'status-badge--inactive';
    default:
      return '';
  }
};

export const formatEmployeeCount = (count: number) => {
  return count === 0 ? 'No Employees' : `${count} Employees`;
};