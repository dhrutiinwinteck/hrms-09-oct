export const formatDate = (iso: string): string => {
  const date = new Date(iso);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getStatusBadgeClass = (status: string): string => {
  return status === 'Active' ? 'badge-success' : 'badge-danger';
};