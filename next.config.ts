import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  turbopack: { root: process.cwd() },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 828, 1080, 1280, 1600, 1920, 2560],
    minimumCacheTTL: 31536000,
  },
  poweredByHeader: false,
  // Baseline hardening. A full CSP is added with the Cal.com embed (it needs frame-src for cal.com).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  // Fix the typos of the legacy Framer URLs so old links keep working.
  async redirects() {
    return [
      { source: "/addmissions.html", destination: "/admissions", permanent: true },
      { source: "/galery.html", destination: "/gallery", permanent: true },
      { source: "/appritiation-letter.html", destination: "/about/appreciation-letters", permanent: true },
      { source: "/research-and-media.html", destination: "/research", permanent: true },
      { source: "/student-login-portal.html", destination: "/student-portal", permanent: true },
      { source: "/about.html", destination: "/about", permanent: true },
      { source: "/programs.html", destination: "/programs", permanent: true },
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/studio-atlas.html", destination: "/programs/commercial-pilot-license", permanent: true },
      { source: "/linear-identity.html", destination: "/programs/aircraft-maintenance-engineering", permanent: true },
      { source: "/pattern-language.html", destination: "/programs/air-traffic-control", permanent: true },
      { source: "/silent-motif.html", destination: "/programs/aviation-disaster-management", permanent: true },
      { source: "/spectrum-project.html", destination: "/programs/cabin-crew-ground-handling", permanent: true },
      { source: "/parallel-forms.html", destination: "/programs/bba-aviation-management", permanent: true },
      { source: "/project-echo.html", destination: "/programs/btech-aerospace-engineering", permanent: true },
      { source: "/future-archive.html", destination: "/programs/multi-engine-rating", permanent: true },
      { source: "/:slug(aerospace-materials-alloy-analysis|aircraft-maintenance-engineering-manual|global-aviation-disaster-management-assessment|integrating-research-in-pilot-training).html", destination: "/research/:slug", permanent: true },
    ];
  },
};

export default config;
