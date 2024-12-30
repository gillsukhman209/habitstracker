import { Inter } from "next/font/google";
import { getSEOTags } from "@/libs/seo";
import ClientLayout from "@/components/LayoutClient";

import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "next-themes";
import ThemeToggleWrapper from "@/components/ThemeToggleWrapper"; // Import the wrapper

const font = Inter({ subsets: ["latin"] });

export const metadata = getSEOTags();

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={font.className}>
      <body>
        {/* Wrap the application with ThemeProvider */}
        <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem>
          <ClientLayout>{children}</ClientLayout>
          {/* Add the ThemeToggleWrapper */}
          <ThemeToggleWrapper />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
