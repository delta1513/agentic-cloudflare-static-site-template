import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Device connectivity",
  description: "Daily hours each device has been online.",
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
