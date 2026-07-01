import { createClient } from "@/lib/supabase/server";
import { NextResponse, NextRequest } from "next/server";

// POST: Used by Navbar logout button
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", request.nextUrl.origin));
}

// GET: Used by middleware to clear stale/invalid sessions
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const response = NextResponse.redirect(new URL("/auth/login", request.nextUrl.origin));
  return response;
}
