import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Inter, Archivo_Black } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Strictly Students",
  description: "A God-centered community that loves people relentlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${archivoBlack.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
