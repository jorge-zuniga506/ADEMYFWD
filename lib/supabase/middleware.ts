import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/app/generated/database.types";

// Routes that require a valid session
const PROTECTED_ROUTES = ["/dashboard"];
// Routes that should redirect to dashboard if already logged in
const AUTH_ROUTES = ["/auth/login", "/auth/register"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request, headers });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
          for (const [key, value] of Object.entries(headers)) {
            supabaseResponse.headers.set(key, value);
          }
        },
      },
    }
  );

  // IMPORTANT: getUser() validates the token with Supabase server
  const { data: { user }, error } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // If session cookie exists but user is invalid/deleted → clear session and redirect to login
  if (error && !user) {
    const hasCookie = request.cookies.getAll().some(
      (c) => c.name.includes("sb-") && c.name.includes("-auth-token")
    );
    if (hasCookie && PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
      // Clear stale session by redirecting to logout
      const logoutUrl = new URL("/auth/logout", request.url);
      return NextResponse.redirect(logoutUrl);
    }
  }

  // Protect dashboard routes: redirect to login if not authenticated
  if (!user && PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}
