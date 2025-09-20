// Re-export authOptions from the pages stub to satisfy relative imports
export { authOptions } from "src/pages/api/auth/[...nextauth]";

// Also export a default handler to match NextAuth handler shape if needed
export { default } from "src/pages/api/auth/[...nextauth]";
