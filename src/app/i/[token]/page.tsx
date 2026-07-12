import { notFound } from "next/navigation";
import { invitation } from "@/content/invitation";
import { getGuest } from "@/lib/guests";
import Countdown from "./sections/Countdown";
import RsvpForm from "./sections/RsvpForm";
import styles from "./invitation.module.css";

export default async function InvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const guest = await getGuest(token);
  if (!guest) notFound();
  const inv = invitation;
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <p className={styles.kicker}>The wedding of</p>
        <h1>{inv.couple.partner1} &amp; {inv.couple.partner2}</h1>
        <p>{inv.dateDisplay}</p>
        <p className={styles.guest}>Dear {guest}</p>
      </section>
      <section className={styles.section}>
        <h2>Events</h2>
        {inv.events.map((e) => (
          <div key={e.name} className={styles.event}>
            <h3>{e.name}</h3>
            <p>{e.time} — {e.venue}</p>
            <p>{e.address}</p>
          </div>
        ))}
      </section>
      <section className={styles.section}>
        <h2>Counting down</h2>
        <Countdown targetISO={inv.dateISO} />
      </section>
      <section className={styles.section}>
        <h2>Gallery</h2>
        <div className={styles.gallery}>
          {inv.gallery.map((src) => <img key={src} src={src} alt="" loading="lazy" />)}
        </div>
      </section>
      <section className={styles.section} id="rsvp">
        <h2>RSVP</h2>
        <RsvpForm token={token} guestName={guest} />
      </section>
      <section className={styles.section} id="messages">
        <h2>Wishes</h2>
        {/* Task 6 */}
      </section>
      <section className={styles.section}>
        <h2>Location</h2>
        <iframe src={inv.mapEmbedUrl} className={styles.map} loading="lazy" />
      </section>
      <section className={styles.section}>
        <h2>{inv.dressCode.title}</h2>
        <p>{inv.dressCode.text}</p>
      </section>
    </main>
  );
}
