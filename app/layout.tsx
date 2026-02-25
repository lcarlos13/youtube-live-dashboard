import "./globals.css";
import BottomNav from "@/components/BottomNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Midia Dashboard",
  description: "Sistema de gerenciamento - Midia Dashboard",
  manifest: "/manifest.json",
  themeColor: "#000000",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-zinc-950 text-white">
        <div className="pb-20">
          {children}
        </div>

        <BottomNav />
      </body>
    </html>
  );
}