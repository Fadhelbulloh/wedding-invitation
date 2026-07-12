export const invitation = {
  couple: { partner1: "Fadhel", partner2: "Partner" },
  dateISO: "2026-12-12T09:00:00+07:00",
  dateDisplay: "Saturday, 12 December 2026",
  events: [
    { name: "Akad", time: "09:00", venue: "Venue Name", address: "Street, City" },
    { name: "Reception", time: "11:00", venue: "Venue Name", address: "Street, City" },
  ],
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=REPLACE_ME",
  gallery: ["/gallery/1.jpg", "/gallery/2.jpg", "/gallery/3.jpg"],
  dressCode: { title: "Dress Code", text: "Formal / batik. Earth tones appreciated." },
};
export type Invitation = typeof invitation;
