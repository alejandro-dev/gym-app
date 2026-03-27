import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({
   subsets: ["latin"],
   variable: "--font-sans",
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
         suppressHydrationWarning
         className={cn("h-full", "antialiased", "font-sans", geist.variable)}
      >
         <body className="min-h-full flex flex-col">
            <Providers>{children}</Providers>
         </body>
      </html>
   );
}
