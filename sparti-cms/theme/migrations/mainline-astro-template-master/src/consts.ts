// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = "Sparti Website Builder";
export const SITE_DESCRIPTION =
  "High-converting websites for service providers — with a built-in CMS.";

export const GITHUB_URL = "https://sparti.ai";

export const SITE_METADATA = {
  title: {
    default: "Sparti Website Builder",
    template: "%s | Sparti",
  },
  description:
    "High-converting websites for service providers — with a built-in CMS.",
  keywords: [
    "website builder",
    "cms",
    "landing page",
    "service business",
    "conversion",
    "sparti",
  ],
  authors: [{ name: "Sparti" }],
  creator: "Sparti",
  publisher: "Sparti",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "48x48" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon/favicon.ico" },
    ],
    apple: [{ url: "/favicon/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: [{ url: "/favicon/favicon.ico" }],
  },
  openGraph: {
    title: "Sparti Website Builder",
    description:
      "High-converting websites for service providers — with a built-in CMS.",
    siteName: "Sparti",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Sparti Website Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sparti Website Builder",
    description:
      "High-converting websites for service providers — with a built-in CMS.",
    images: ["/og-image.jpg"],
    creator: "@sparti",
  },
};