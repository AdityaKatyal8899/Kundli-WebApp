import { Playfair_Display, Inter, Noto_Sans_Devanagari } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-hindi",
  display: "swap",
});

export const metadata = {
  title: "KUNDLI - Modern Kundli Matching Platform",
  description:
    "A premium, modern Kundli matching platform that bridges tradition and compatibility. Find your perfect match with intelligent guna analysis.",
};

export const viewport = {
  themeColor: "#ff4fa3",
};

import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }) {
  // Use the Client ID from your Google Developer Console
  const GOOGLE_CLIENT_ID = "248743347580-gu2jrqkl9najo0ar07ek6pnqj8davv92.apps.googleusercontent.com";

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${playfairDisplay.variable} ${inter.variable} ${notoSansDevanagari.variable}`}
    >
      <body className="font-sans antialiased">
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <ThemeProvider
            attribute="data-theme"
            defaultTheme="dark"
            enableSystem={false}
          >
            {children}
            <Analytics />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "#2a004f",
                  color: "#fff",
                  border: "1px solid #ff4da6",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontFamily: "var(--font-sans)",
                },
                success: {
                  iconTheme: {
                    primary: "#ff4da6",
                    secondary: "#1a002e",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "#ff4d6d",
                    secondary: "#1a002e",
                  },
                },
              }}
            />
          </ThemeProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
