import { Navbar } from "@/components/ui/navbar";
import { TanstackQueryClientProvider } from "@/providers/QueryProvider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Click Rush - 60 second click challenge",
  description:
    "Challenge your speed in ClickRush! Click as many times as possible in 60 seconds, track your scores, and compete on global, daily, and weekly leaderboards",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <TanstackQueryClientProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="bg-slate-950/80 min-h-full flex flex-col">
          <Navbar />
          {children}
        </body>
      </html>
    </TanstackQueryClientProvider>
  );
}
