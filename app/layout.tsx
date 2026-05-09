import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
