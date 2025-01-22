import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Counter with Zustand",
  description: "An example use of Zustand",
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
