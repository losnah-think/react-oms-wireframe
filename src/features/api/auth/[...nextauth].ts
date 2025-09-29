// Re-export authOptions and default from the actual pages API handler so TypeScript
// resolves the module correctly during compilation.
export { authOptions } from "../../../../pages/api/auth/[...nextauth]";
export { default } from "../../../../pages/api/auth/[...nextauth]";
