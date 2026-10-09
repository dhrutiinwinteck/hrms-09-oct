export function insertMergeField(
  content: string,
  token: string,
): string {
  const separator =
    content.length > 0 && !content.endsWith(" ")
      ? " "
      : "";

  return `${content}${separator}${token}`;
}

export function extractMergeFields(
  content: string,
): string[] {
  const matches = content.match(/\{\{[^}]+\}\}/g);

  return matches ? Array.from(new Set(matches)) : [];
}