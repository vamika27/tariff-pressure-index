import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://tariff-pressure-index.vercel.app"),
  title: "Tariff Pressure Index Dashboard",
  applicationName: "Tariff Pressure Index",
  description:
    "A warm interactive dashboard showing which S&P 500 companies are most exposed to tariff pressure.",
  icons: {
    icon: "/icon.svg"
  },
  openGraph: {
    title: "Tariff Pressure Index",
    description:
      "Which S&P 500 companies are most exposed to global trade disruption — and why.",
    images: ["/logo.svg"]
  }
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
