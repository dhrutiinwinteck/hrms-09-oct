export const downloadBlobFile = (
  blob: Blob,
  fileName: string,
): void => {
  const blobUrl = window.URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = blobUrl;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();

  link.remove();

  window.URL.revokeObjectURL(blobUrl);
};