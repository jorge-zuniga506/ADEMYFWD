import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// POST: Used by Navbar logout button
export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"));
}

// GET: Used by middleware to clear stale/invalid sessions
export async function GET() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const response = NextResponse.redirect(new URL("/auth/login", process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"));
  return response;
}
