import config from "@/config";

// These are all the SEO tags you can add to your pages.
// It prefills data with default title/description/OG, etc.. and you can cusotmize it for each page.
// It's already added in the root layout.js so you don't have to add it to every pages
// But I recommend to set the canonical URL for each page (export const metadata = getSEOTags({canonicalUrlRelative: "/"});)
// See https://21habits.co/docs/features/seo
export const getSEOTags = ({
  title,
  description,
  keywords,
  openGraph,
  canonicalUrlRelative,
  extraTags,
} = {}) => {
  return {
    // up to 50 characters
    title: title || config.appName,
    // up to 160 characters
    description: description || config.appDescription,
    // some keywords separated by commas
    keywords: keywords || [config.appName],
    applicationName: config.appName,
    metadataBase: new URL("https://21habits.co"), // Ensure HTTPS is used

    openGraph: {
      title: openGraph?.title || config.appName,
      description: openGraph?.description || config.appDescription,
      url: openGraph?.url || `https://${config.domainName}/`,
      siteName: openGraph?.title || config.appName,
      images: [
        {
          url: `https://${config.domainName}/assets/og-image.png`, // Replace with your actual image path
          width: 1200,
          height: 630,
          alt: "21 Habits - Build lasting habits with accountability",
        },
      ],
      locale: "en_US",
      type: "website",
    },

    twitter: {
      title: openGraph?.title || config.appName,
      description: openGraph?.description || config.appDescription,
      images: [`https://${config.domainName}/assets/twitter-image.png`], // Replace with your actual image path
      card: "summary_large_image",
      creator: "@marc_louvion", // Update with your own Twitter handle if needed
    },

    ...(canonicalUrlRelative && {
      alternates: { canonical: canonicalUrlRelative },
    }),

    ...extraTags,
  };
};
