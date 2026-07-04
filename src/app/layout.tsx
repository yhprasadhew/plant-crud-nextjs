import type { Metadata } from "next";
import { HexclaveProvider, HexclaveTheme } from "@hexclave/next";
import { hexclaveClientApp } from "../stack/client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";

//import Header from "./components/Header";
//import Footer from "./components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Plant Inventory",
  description: "Plant Inventory Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col"><HexclaveProvider app={hexclaveClientApp}><HexclaveTheme>
          <ThemeProvider>
        <Navbar />
        <main className="flex-1">
          {children}
        </main>

        <h1 className="bg-white text-black dark:bg-slate-950 dark:text-white p-4">Footer </h1>
        </ThemeProvider>
      </HexclaveTheme></HexclaveProvider></body>
    </html>
  );
}