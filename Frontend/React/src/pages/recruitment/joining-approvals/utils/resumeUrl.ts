const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8001';

export const getResumeUrl = (
  resumePath: string | null | undefined,
): string | null => {
  if (!resumePath) {
    return null;
  }

  const normalizedPath = resumePath
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\/+/, '');

  if (
    !normalizedPath ||
    normalizedPath === 'Not available' ||
    normalizedPath === '-'
  ) {
    return null;
  }

  const uploadsIndex = normalizedPath.indexOf('uploads/');

  if (uploadsIndex === -1) {
    return null;
  }

  const relativePath = normalizedPath.substring(
    uploadsIndex + 'uploads/'.length,
  );

  if (!relativePath) {
    return null;
  }

  const encodedPath = relativePath
    .split('/')
    .map(encodeURIComponent)
    .join('/');

  return `${API_BASE_URL.replace(/\/+$/, '')}/uploads/${encodedPath}`;
};