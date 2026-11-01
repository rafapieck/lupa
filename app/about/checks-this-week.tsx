import { connection } from "next/server";
import { getChecksThisWeek } from "@/lib/checks-this-week";

export const CHECKS_LABEL = "Revisiones esta semana:";

/** North Star counter. Renders nothing if the number can't be read: never an error. */
export default async function ChecksThisWeek() {
  await connection(); // fresh number on every visit, never prerendered
  const n = await getChecksThisWeek();
  if (n === null) return null;
  return (
    <p className="rounded-2xl bg-blue-50 p-5 text-center text-xl text-gray-900 ring-1 ring-blue-100">
      {CHECKS_LABEL} <strong className="text-3xl font-bold text-blue-800">{n.toLocaleString("es-MX")}</strong>
    </p>
  );
}
