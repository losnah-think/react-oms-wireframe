import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        const rawEmail = credentials?.email;
        const password = credentials?.password;
        const email =
          typeof rawEmail === "string"
            ? rawEmail.replace(/\s/g, "+")
            : rawEmail;
        if (!email || !password) {
          console.log("[nextauth] authorize: missing credentials");
          return null;
        }
        try {
          console.log("[nextauth] authorize: attempting DB lookup for", email);
          const masked = {
            email,
            password: typeof password === "string" ? "***" : undefined,
          };
          // masked for local logs
          const { getUserByEmail } = await import("src/lib/users");
          const bcryptMod = await import("bcryptjs");
          const bcrypt =
            bcryptMod && (bcryptMod as any).compare
              ? bcryptMod
              : bcryptMod && (bcryptMod as any).default
                ? (bcryptMod as any).default
                : bcryptMod;
          const u = await getUserByEmail(email);
          console.log("[nextauth] db lookup result for", email, !!u);
          if (u) {
            const hash = (u as any).password_hash;
            console.log("[nextauth] db hash present?", !!hash);
            if (hash) {
              const ok = await bcrypt.compare(password, hash);
              console.log("[nextauth] bcrypt compare result", ok);
              if (ok)
                return {
                  id: u.id,
                  name: u.name || u.email,
                  email: u.email,
                  role: (u as any).role || "operator",
                };
            }
          }
          try {
            const sbUrl = process.env.SUPABASE_URL;
            const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
            if (sbUrl && sbKey) {
              const fetch = (await import("node-fetch")).default;
              const bcryptMod2 = await import("bcryptjs");
              const bcrypt2 =
                bcryptMod2 && (bcryptMod2 as any).compare
                  ? bcryptMod2
                  : bcryptMod2 && (bcryptMod2 as any).default
                    ? (bcryptMod2 as any).default
                    : bcryptMod2;
              const url = `${sbUrl.replace(/\/$/, "")}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=*`;
              console.log("[nextauth] Supabase REST GET", url);
              const resp = await fetch(url, {
                method: "GET",
                headers: {
                  apikey: sbKey,
                  Authorization: `Bearer ${sbKey}`,
                  Accept: "application/json",
                },
              });
              if (resp.ok) {
                const rows = await resp.json();
                const su = Array.isArray(rows) && rows[0];
                console.log("[nextauth] sb lookup found=", !!su);
                if (su && su.password_hash) {
                  const ok = await bcrypt2.compare(password, su.password_hash);
                  console.log("[nextauth] Supabase bcrypt compare", ok);
                  // sb bcrypt result logged above
                  if (ok)
                    return {
                      id: su.id || "sb-" + (su.email || ""),
                      name: su.name || su.email,
                      email: su.email,
                      role: su.role || "operator",
                    };
                }
              } else {
                console.warn(
                  "[nextauth] Supabase REST GET failed",
                  resp.status,
                );
                console.log("[nextauth] sb_get_failed status=", resp.status);
              }
            }
          } catch (e2) {
            console.error(
              "[nextauth] Supabase REST fallback error",
              String(e2),
            );
            console.log("[nextauth] sb_error=", String(e2));
          }
          console.log(
            "[nextauth] authorize: no matching credentials for",
            email,
          );
          return null;
        } catch (e) {
          console.error(
            "[nextauth] DB lookup failed, trying Supabase REST fallback:",
            String(e),
          );
          console.log("[nextauth] db_error=", String(e));
          try {
            const sbUrl = process.env.SUPABASE_URL;
            const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
            if (sbUrl && sbKey) {
              const fetch = (await import("node-fetch")).default;
              const bcryptMod2 = await import("bcryptjs");
              const bcrypt =
                bcryptMod2 && (bcryptMod2 as any).compare
                  ? bcryptMod2
                  : bcryptMod2 && (bcryptMod2 as any).default
                    ? (bcryptMod2 as any).default
                    : bcryptMod2;
              const url = `${sbUrl}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=*`;
              const resp = await fetch(url, {
                method: "GET",
                headers: {
                  apikey: sbKey,
                  Authorization: `Bearer ${sbKey}`,
                  Accept: "application/json",
                },
              });
              if (resp.ok) {
                const rows = await resp.json();
                const u = Array.isArray(rows) && rows[0];
                if (u && u.password_hash) {
                  const ok = await bcrypt.compare(password, u.password_hash);
                  if (ok)
                    return {
                      id: u.id || "sb-" + (u.email || ""),
                      name: u.name || u.email,
                      email: u.email,
                      role: u.role || "operator",
                    };
                }
              }
            }
          } catch (e2) {
            // ignore and fallthrough to env-admin fallback
          }
          const envAdminEmail = process.env.ADMIN_EMAIL?.trim();
          const envAdminPassword = process.env.ADMIN_PASSWORD?.trim();
          if (
            envAdminEmail &&
            envAdminPassword &&
            typeof email === "string" &&
            envAdminEmail.toLowerCase() === email.toLowerCase() &&
            password === envAdminPassword
          ) {
            console.log(
              "[nextauth] authorize: environment admin login used for",
              email,
            );
            return { id: "admin", name: "Admin", email, role: "admin" };
          }
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = (user as any).role || token.role;
      }
      if (!token.role && user && (user as any).email) {
        try {
          const { getUserByEmail } = await import("src/lib/users");
          const u = await getUserByEmail((user as any).email);
          token.role = u?.role || "operator";
        } catch (e) {
          token.role = "operator";
        }
      }
      token.role = token.role || "operator";
      return token;
    },
    async session({ session, token }: any) {
      (session as any).user = {
        ...(session as any).user,
        role: (token as any).role,
      };
      return session;
    },
  },
  session: { strategy: "jwt" },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: { signIn: "/login" },
};

export default NextAuth(authOptions as any);
