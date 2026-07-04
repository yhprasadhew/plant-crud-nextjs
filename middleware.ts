import { authClient } from "@/lib/auth";

export default authClient.middleware({
  loginUrl: "/sign-in",
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - sign-in and sign-up pages
     */
    "/((?!_next/static|_next/image|favicon.ico|public|sign-in|sign-up).*)",
  ],
};
