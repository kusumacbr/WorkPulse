import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WorkPulse® | Unified Workforce Execution & Operations",
  description:
    "Official internal workforce platform for Start-of-Day planning, biometric shift attendance, two-tier leave governance, and quarterly OKR milestones.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

const themeInitScript = `
  (function() {
    try {
      var storedTheme = localStorage.getItem('workpulse-theme');
      var isDark = storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches) || (storedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (storedTheme === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        document.documentElement.style.colorScheme = 'light';
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        document.documentElement.style.colorScheme = 'dark';
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased font-sans bg-background text-foreground transition-colors duration-150">
        <ThemeProvider defaultTheme="dark">{children}</ThemeProvider>
      </body>
    </html>
  );
}


