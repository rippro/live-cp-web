import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NavigationProgress } from "@/components/ui/NavigationProgress";

export const metadata: Metadata = {
  title: "RipPro Judge",
  description: "競プロ新歓イベント向けローカル実行ジャッジシステム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="bg-rp-900 text-rp-100 antialiased">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
          <NavigationProgress />
        </ThemeProvider>
      </body>
    </html>
  );
}
