export function formatOfferLetterDate(
  value: string,
): string {
  if (!value) {
    return "";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function isValidLogoFile(file: File): boolean {
  const validTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  const maxSize = 2 * 1024 * 1024;

  return (
    validTypes.includes(file.type) &&
    file.size <= maxSize
  );
}