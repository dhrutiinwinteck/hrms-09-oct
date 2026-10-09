/**
 * Global Type Declarations
 */

// CSS Modules
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

// Images
declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.gif' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

// JSON files
declare module '*.json' {
  const value: any;
  export default value;
}