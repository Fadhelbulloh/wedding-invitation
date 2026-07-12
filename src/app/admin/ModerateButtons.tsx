"use client";

export default function ModerateButtons({ id }: { id: string }) {
  async function act(status: "approved" | "rejected") {
    await fetch("/api/admin/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    window.location.reload();
  }
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button onClick={() => act("approved")}>Approve</button>
      <button onClick={() => act("rejected")}>Reject</button>
    </div>
  );
}
