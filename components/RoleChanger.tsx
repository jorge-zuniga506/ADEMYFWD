"use client";

import { updateUserRole } from "@/lib/actions/admin";

const roles = ["ESTUDIANTE", "INSTRUCTOR", "GRADUADO_FWD", "ADMIN"];

export default function RoleChanger({
  userId,
  currentRol,
}: {
  userId: string;
  currentRol: string;
}) {
  return (
    <form action={updateUserRole.bind(null, userId)}>
      <select
        name="nuevoRol"
        defaultValue={currentRol}
        onChange={(e) => {
          if (e.target.value !== currentRol) {
            e.target.form?.requestSubmit();
          }
        }}
        className="rounded-lg border border-zinc-300 px-2 py-1 text-xs focus:border-primary-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 text-zinc-850 dark:text-zinc-150"
      >
        {roles.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
    </form>
  );
}
