import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { UserContext } from "@/context/userContext";
import { BusinessContext } from "@/context/businessContext";
import { ReviewsContext } from "@/context/reviewContext";
import CustomSessionProvider from "./components/session-provider";

const PROD_URL = "https://reviews.rategate.cc";

export const metadata: Metadata = {
  title: "Rategate",
  description: "AI-powered review and reputation management platform",
  metadataBase: new URL(PROD_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Rategate",
    description: "AI-powered review and reputation management platform",
    url: PROD_URL,
    siteName: "Rategate",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isVercelPreview =
    process.env.NEXT_PUBLIC_VERCEL_ENV !== "production";

  return (
    <html lang="en">
      <head>
        {/* 🚫 Prevent indexing of staging / preview */}
        {isVercelPreview && (
          <meta name="robots" content="noindex, nofollow" />
        )}

        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GOOGLE_ANALYTICS_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.GOOGLE_ANALYTICS_ID}');
          `}
        </Script>
      </head>

      <body className="antialiased">
        <CustomSessionProvider>
          <UserContext>
            <BusinessContext>
              <ReviewsContext>{children}</ReviewsContext>
            </BusinessContext>
          </UserContext>
        </CustomSessionProvider>
      </body>
    </html>
  );
}
