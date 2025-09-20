// Minimal stub to satisfy src imports during tests
import NextAuth from "next-auth";

// Minimal stub to satisfy src imports during tests
export const authOptions = {} as any;
export default (req: any, res: any) => NextAuth(req, res, authOptions as any);
