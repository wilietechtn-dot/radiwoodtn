import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

import SiteChrome from "@/components/SiteChrome";
import { CartProvider } from "@/components/CartProvider";

export const metadata: Metadata = {
  title: "RadiWood — Bois d'Olivier",
  description:
    "Créations artisanales tunisiennes en bois d'olivier.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <CartProvider>
          <SiteChrome>{children}</SiteChrome>
        </CartProvider>
      </body>
    </html>
  );
}