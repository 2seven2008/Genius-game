import type { Metadata, Viewport } from "next";
import { Orbitron, Exo_2 } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
  weight: ["400", "700", "800", "900"],
});

const exo2 = Exo_2({
  subsets: ["latin"],
  variable: "--font-exo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GENIUS – Jogo de Memória Multiplayer",
  description:
    "O clássico jogo Genius / Simon Says com modo multiplayer em tempo real.",
  manifest: "/manifest.json",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "GENIUS",
    description: "Jogue Genius contra seus amigos em tempo real!",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A0A0F",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${orbitron.variable} ${exo2.variable}`}>
      <body className="bg-dark-base text-white font-body antialiased">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#12121A",
              color: "#fff",
              border: "1px solid #1E1E2E",
              fontFamily: "var(--font-exo)",
            },
            success: { iconTheme: { primary: "#C026D3", secondary: "#fff" } },
            error: { iconTheme: { primary: "#EF4444", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
