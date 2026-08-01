import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
  keywords:
    "태양계,행성,3D,인터랙티브,교육,Solar System,Planets,Interactive,Minseok Shin",
  robots: "index, follow",
  openGraph: {
    title: site.title,
    description: site.description,
    siteName: site.title,
    type: "website",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
