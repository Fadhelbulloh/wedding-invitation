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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Inter:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
