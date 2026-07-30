import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BeautyGen · 医美AI图像生成",
  description: "专业医美AI图像生成平台，术前/术后效果可视化",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
