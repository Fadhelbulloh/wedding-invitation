import type { Metadata } from "next";
import "./globals.css";
import { invitation } from "@/content/invitation";

export const metadata: Metadata = {
  title: `${invitation.couple.partner1} & ${invitation.couple.partner2} — Wedding Invitation`,
  description: `Join us to celebrate our wedding on ${invitation.dateDisplay}.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
