import type { Metadata } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const atkinsonHyperlegible = Atkinson_Hyperlegible({
   variable: "--font-sans",
   subsets: ["latin"],
   weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Gym App",
  description: "Panel web para gestionar la aplicación del gimnasio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${atkinsonHyperlegible.variable} ${atkinsonHyperlegible.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
