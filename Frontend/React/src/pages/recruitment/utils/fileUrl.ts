// const API_BASE_URL = (
//   import.meta.env.VITE_API_BASE_URL || ""
// ).replace(/\/+$/, "");

// export const getFileUrl = (
//   filePath?: string | null,
// ): string => {
//   if (!filePath) {
//     return "";
//   }

//   const value = filePath.trim();

//   if (!value) {
//     return "";
//   }

//   /*
//    * If backend already returns a complete URL,
//    * don't modify it.
//    *
//    * Example:
//    * http://192.168.48.1:8001/uploads/logo.png
//    */
//   if (/^https?:\/\//i.test(value)) {
//     return value;
//   }

//   /*
//    * Normalize Windows-style paths.
//    *
//    * Example:
//    * uploads\company\logo.png
//    * becomes:
//    * uploads/company/logo.png
//    */
//   const normalizedPath = value
//     .replace(/\\/g, "/")
//     .replace(/^\/+/, "");

//   /*
//    * Backend should normally return:
//    *
//    * /uploads/logo.png
//    *
//    * or:
//    *
//    * uploads/logo.png
//    *
//    * Final result:
//    *
//    * http://192.168.48.1:8001/uploads/logo.png
//    */
//   return `${API_BASE_URL}/${normalizedPath}`;
// };


const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || ""
).replace(/\/+$/, "");

export const getFileUrl = (
  filePath?: string | null,
): string => {
  if (!filePath) {
    return "";
  }

  const value = filePath.trim();

  if (!value) {
    return "";
  }

  // Backend already returned a complete URL.
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  // Normalize Windows-style paths.
  const normalizedPath = value
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");

  // If API base URL is configured, use backend URL.
  if (API_BASE_URL) {
    return `${API_BASE_URL}/${normalizedPath}`;
  }

  // Fallback for relative paths.
  return `/${normalizedPath}`;
};