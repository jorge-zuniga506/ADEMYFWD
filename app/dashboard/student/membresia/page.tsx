import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MembresiaClient from "./MembresiaClient";

export default async function MembresiaPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Fetch all active membership tiers
  const { data: memberships } = await supabase
    .from("Membership")
    .select("*")
    .eq("activa", true)
    .order("precio");

  // Fetch user's active subscription
  const { data: activeSubs } = await supabase
    .from("UserMembership")
    .select("*, Membership(nombre, tipo)")
    .eq("userId", user.id)
    .eq("estado", "ACTIVA")
    .order("createdAt", { ascending: false })
    .limit(1);

  const activeSub = activeSubs?.[0] ?? null;

  return (
    <div className="min-h-screen bg-[#0d0e14] py-8">
      <MembresiaClient
        memberships={(memberships ?? []) as never}
        activeSub={activeSub as never}
        justSubscribed={params.success === "1"}
        canceled={params.canceled === "1"}
      />
    </div>
  );
}
