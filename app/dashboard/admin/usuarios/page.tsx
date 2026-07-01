import { createClient } from "@/lib/supabase/server";
import { Badge, Button } from "@/components/ui";
import { Search, Users } from "lucide-react";
import RoleChanger from "@/components/RoleChanger";

export default async function UsuariosPage() {
  const supabase = await createClient();

  const { data: users } = await supabase
    .from("User")
    .select("id, nombre, email, rol, fechaRegistro")
    .order("fechaRegistro", { ascending: false });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Gestion de Usuarios
        </h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Moderacion, suspensiones y roles
        </p>
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900">
        <Search className="h-4 w-4 text-zinc-400" />
        <input
          placeholder="Buscar por nombre o email..."
          className="flex-1 bg-transparent text-sm focus:outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Registro</th>
              <th className="px-4 py-3 font-medium">Accion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {users?.map((user) => (
              <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                <td className="px-4 py-3">{user.nombre}</td>
                <td className="px-4 py-3 text-zinc-500">{user.email}</td>
                <td className="px-4 py-3">
                  <Badge
                    variant={
                      user.rol === "ADMIN"
                        ? "fwd"
                        : user.rol === "INSTRUCTOR"
                          ? "success"
                          : "default"
                    }
                  >
                    {user.rol}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {new Date(user.fechaRegistro).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <RoleChanger userId={user.id} currentRol={user.rol} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(!users || users.length === 0) && (
        <div className="rounded-xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
          <Users className="mx-auto mb-3 h-8 w-8 text-zinc-300 dark:text-zinc-600" />
          <p className="text-zinc-500 dark:text-zinc-400">No hay usuarios registrados.</p>
        </div>
      )}
    </div>
  );
}
