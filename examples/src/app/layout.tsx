import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const font = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Formly — Lightweight React Form State & Validation Toolkit",
  description:
    "Explore Formly, a lightweight, type-safe React form validation and state management toolkit built for developer ergonomics. View examples of basic forms, conditional rendering, nested arrays, wizard flows, and draft persistence.",
  keywords: [
    "react forms",
    "react form validation",
    "formly",
    "zod validation",
    "type-safe forms",
    "react hooks forms",
    "react validation library",
    "conditional forms react",
    "wizard form react",
    "draft persistence react forms",
  ],
  authors: [{ name: "explita" }],
  openGraph: {
    title: "Formly — React Form Toolkit Examples",
    description:
      "A lightweight, unopinionated React form toolkit built with developer ergonomics in mind. Manage complex state, conditional fields, and Zod schemas seamlessly.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full dark"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body
        className={`${font.className} antialiased min-h-full flex flex-col`}
      >
        {children}
      </body>
    </html>
  );
}
