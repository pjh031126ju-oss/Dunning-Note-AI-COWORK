import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-serif-display",
});

export const metadata: Metadata = {
  title: "Dunning Note AI | 더닝노트",
  description: "PARA 기반 로컬 메모 정리 프로토타입",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={cormorant.variable}>{children}</body>
    </html>
  );
}
