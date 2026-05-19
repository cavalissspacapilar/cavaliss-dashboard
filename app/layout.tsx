import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import DashboardLayout from "@/components/layout/DashboardLayout";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Cavaliss Spa Capilar — Centro de Control",
  description: "Dashboard operativo de Cavaliss Spa Capilar, Cancún",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} bg-[#0a0a0a] text-zinc-100 overflow-hidden`}>
        <DashboardLayout>{children}</DashboardLayout>
      </body>
    </html>
  );
}
