import "./globals.css";
import BottomNav from "@/components/BottomNav";

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