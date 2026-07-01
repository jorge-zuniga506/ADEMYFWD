import { createClient } from "@/lib/supabase/server";
import NavbarClient from "@/components/NavbarClient";

export default async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let perfil = null;
  if (user) {
    const { data } = await supabase
      .from("User")
      .select("nombre, rol")
      .eq("id", user.id)
      .single();
    perfil = data;
  }

  const userName = perfil?.nombre ?? user?.email?.split("@")[0];

  return (
    <NavbarClient
      isLoggedIn={!!user}
      userName={userName}
    />
  );
}
