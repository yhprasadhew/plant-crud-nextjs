import { createNeonAuth } from "@neondatabase/auth/next/server";
import { cookies } from "next/headers";

export const authClient = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
});

export async function getCurrentUser(request?: Request) {
  try {
    const { data } = await authClient.getSession();
    return data?.user || null;
  } catch (error) {
    console.error("Failed to get current user:", error);
    return null;
  }
}

export async function getUserSession(request?: Request) {
  try {
    const { data } = await authClient.getSession();
    return data || null;
  } catch (error) {
    console.error("Failed to get session:", error);
    return null;
  }
}
