import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { expectedSession } from "@/lib/admin-auth";
import { listMessages, listRsvps } from "@/lib/storage";
import ModerateButtons from "./ModerateButtons";

export default async function AdminPage() {
  const c = await cookies();
  if (c.get("admin_session")?.value !== expectedSession()) redirect("/admin/login");
  const pending = await listMessages("pending");
  const rsvps = await listRsvps();
  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: 20 }}>
      <h1>Admin</h1>
      <h2>Pending messages ({pending.length})</h2>
      {pending.map((m) => (
        <div key={m.id} style={{ border: "1px solid #ccc", borderRadius: 8, padding: 12, marginBottom: 12 }}>
          <strong>{m.name}</strong>
          <p>{m.text}</p>
          <ModerateButtons id={m.id} />
        </div>
      ))}
      <h2>RSVPs ({rsvps.length})</h2>
      <table>
        <thead><tr><th>Name</th><th>Attending</th><th>Count</th><th>Note</th></tr></thead>
        <tbody>
          {rsvps.map((r) => (
            <tr key={r.token}><td>{r.name}</td><td>{r.attending ? "yes" : "no"}</td><td>{r.count}</td><td>{r.note}</td></tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
