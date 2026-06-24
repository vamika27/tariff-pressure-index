import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tariff Pressure Index Dashboard",
  description:
    "A warm interactive dashboard showing which S&P 500 companies are most exposed to tariff pressure."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
