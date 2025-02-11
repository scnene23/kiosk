import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import {LanguageProvider} from "@/context/LanguageContext/page"; // Componente cliente para o LanguageProvider

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Extensions myPMS",
  description: "Extensions myPMS",
};

export default function RootLayout({
  children,
}: {
  children?: React.ReactNode; // Torna `children` opcional
}) {
  return (
    <html lang="en">
            <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            {/* Main Content Area */}
            <div className="flex-grow overflow-x-hidden h-full h-screen">
            <LanguageProvider>{children}</LanguageProvider>
            </div>
      </body>
    </html>
  );
}
