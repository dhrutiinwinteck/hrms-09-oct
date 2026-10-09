export const formatSalary = (
  salary: number,
): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(salary);
};

export const getShowingStart = (
  total: number,
  page: number,
  pageSize: number,
): number => {
  if (total === 0) {
    return 0;
  }

  return (page - 1) * pageSize + 1;
};

export const getShowingEnd = (
  total: number,
  page: number,
  pageSize: number,
): number => {
  return Math.min(
    page * pageSize,
    total,
  );
};