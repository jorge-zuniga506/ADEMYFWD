import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./skeleton.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NextTopLoader from "nextjs-toploader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "U-Forward",
  description: "Cursos premium en video con progreso, certificados y comunidad. Frontend, backend y lógica web para la comunidad U-Forward.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* Barra de progreso de navegación estilo GitHub — aparece instantáneamente */}
        <NextTopLoader
          color="linear-gradient(to right, #06b6d4, #a855f7, #ec4899)"
          initialPosition={0.12}
          crawlSpeed={150}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={250}
          shadow="0 0 10px #a855f7, 0 0 6px #06b6d4"
        />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
