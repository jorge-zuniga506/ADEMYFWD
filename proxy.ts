import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Excludes /api/* and /dashboard/*: Next.js auto-buffers/clones the
    // request body for any route the proxy matches, which corrupts
    // multipart/form-data (and, per Next's own docs, breaks Server Function
    // submissions the same way — "a Proxy matcher that excludes a path will
    // also skip Server Function calls on that path"). This broke every
    // <form action={someServerAction}> under /dashboard (course creation,
    // profile updates, Q&A, etc.), not just file uploads.
    // API routes and every /dashboard page/action already authenticate
    // themselves via supabase.auth.getUser(), so neither needs this
    // middleware's session handling — this is Next's documented pattern
    // ("verify auth inside each Server Function rather than relying on
    // Proxy alone"), not a workaround.
    "/((?!_next/static|_next/image|favicon.ico|api/|dashboard(?:/|$)|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
