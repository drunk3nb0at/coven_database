import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "COVENS — 阅读即抵抗",
  description: "华语激进性别政治共享知识库",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
