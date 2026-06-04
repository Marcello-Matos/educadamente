import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/use-auth";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PsiClinic - Sistema de Gestão para Psicólogos",
  description: "Sistema completo de gestão clínica para psicólogos com prontuário eletrônico, agenda, financeiro e teleconsulta.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.className} h-full antialiased`}>
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className="min-h-full bg-gray-50" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
