import type { Metadata } from "next";
import { Spline_Sans } from "next/font/google";
import "./globals.css";
import Providers from '@/components/Providers';

const splineSans = Spline_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"], // Removed 800 to avoid possible Google Fonts fetch errors in some environments
  variable: "--font-spline-sans",
});

export const metadata: Metadata = {
  title: "LinguaGame - Learn English through play",
  description: "The most fun way to master English vocabulary",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
        <script
          src={process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
            ? "https://app.midtrans.com/snap/snap.js"
            : (process.env.NEXT_PUBLIC_MIDTRANS_IS_SANDBOX === 'true' || process.env.MIDTRANS_IS_SANDBOX === 'true' || process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY?.startsWith('SB-'))
              ? "https://app.sandbox.midtrans.com/snap/snap.js"
              : "https://app.midtrans.com/snap/snap.js"}
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          defer
        ></script>
        {process.env.NEXT_PUBLIC_ADSENSE_PUB_ID && (
          <>
            <meta name="google-adsense-account" content={process.env.NEXT_PUBLIC_ADSENSE_PUB_ID} />
            <script
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUB_ID}`}
              crossOrigin="anonymous"
            ></script>
          </>
        )}
      </head>
      <body
        className={`${splineSans.variable} font-sans antialiased bg-background-light dark:bg-background-dark text-slate-900 dark:text-white`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
