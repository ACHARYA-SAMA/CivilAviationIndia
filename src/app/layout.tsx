import type { Metadata, Viewport } from "next";
import { B612_Mono, Mona_Sans } from "next/font/google";
import { Chrome } from "@/components/layout/Chrome";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { site } from "@/content/site";
import "./globals.css";

/*
  Self-hosted at build time by next/font.
  Mona Sans (variable weight): every title and all reading text, tight and mixed case.
  B612 Mono: the typeface Airbus commissioned for cockpit displays, used only on instrument readouts.
*/
const mona = Mona_Sans({ subsets: ["latin"], variable: "--font-mona", display: "swap" });
// Readouts are never the first thing on screen, so B612 is not preloaded.
const b612 = B612_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-b612", display: "swap", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? site.url),
  title: { default: `${site.name} | ${site.society}`, template: `%s | ${site.name}` },
  description: site.description,
  openGraph: {
    title: site.name,
    description: site.description,
    type: "website",
    siteName: site.name,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: site.name }],
  },
};

export const viewport: Viewport = { themeColor: "#e5f1fc", colorScheme: "light" };

const INTRO_SCRIPT = `try{if(location.pathname==="/"&&!sessionStorage.getItem("assi-intro")&&!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.dataset.intro="on"}catch(e){}`;

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en" className={`${mona.variable} ${b612.variable}`} suppressHydrationWarning>
    <head>
      {/* Raises the Home intro curtain before first paint (first visit of the session only). */}
      <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
    </head>
    <body>
      <a
        href="#main"
        className="fixed top-3 left-3 z-[100] -translate-y-20 rounded-full bg-act px-4 py-2 text-sm font-medium text-act-ink focus:translate-y-0"
      >
        Skip to content
      </a>
      <SmoothScroll>
        <Chrome />
        <Navbar />
        <main id="main">{children}</main>
        <Footer />
      </SmoothScroll>
    </body>
  </html>
);

export default RootLayout;
