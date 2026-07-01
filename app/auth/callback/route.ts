import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const response = NextResponse.redirect(`${origin}${next}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet, headers) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
            for (const [key, value] of Object.entries(headers)) {
              response.headers.set(key, value);
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Check if user has completed onboarding
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: perfil } = await supabase
          .from("User")
          .select("onboardingDone")
          .eq("id", user.id)
          .single();

        // If user has no profile row OR hasn't done onboarding → redirect to onboarding
        if (!perfil || !perfil.onboardingDone) {
          return NextResponse.redirect(`${origin}/auth/onboarding`, {
            headers: response.headers,
          });
        }
      }
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=Auth+failed`);
}
