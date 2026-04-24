import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalPath?: string;
}

/**
 * Custom hook to set page-level SEO meta tags.
 * Cleans up on unmount to avoid stale tags.
 */
export function useSEO({ title, description, keywords, ogImage, ogType = "website", canonicalPath }: SEOProps) {
  useEffect(() => {
    // Set document title
    document.title = title;

    const tags: HTMLElement[] = [];

    // Meta description
    const descMeta = document.createElement("meta");
    descMeta.name = "description";
    descMeta.content = description;
    document.head.appendChild(descMeta);
    tags.push(descMeta);

    // Meta keywords
    if (keywords) {
      const kwMeta = document.createElement("meta");
      kwMeta.name = "keywords";
      kwMeta.content = keywords;
      document.head.appendChild(kwMeta);
      tags.push(kwMeta);
    }

    // OG title
    const ogTitle = document.createElement("meta");
    ogTitle.setAttribute("property", "og:title");
    ogTitle.content = title;
    document.head.appendChild(ogTitle);
    tags.push(ogTitle);

    // OG description
    const ogDesc = document.createElement("meta");
    ogDesc.setAttribute("property", "og:description");
    ogDesc.content = description;
    document.head.appendChild(ogDesc);
    tags.push(ogDesc);

    // OG type
    const ogTypeMeta = document.createElement("meta");
    ogTypeMeta.setAttribute("property", "og:type");
    ogTypeMeta.content = ogType;
    document.head.appendChild(ogTypeMeta);
    tags.push(ogTypeMeta);

    // OG image
    if (ogImage) {
      const ogImg = document.createElement("meta");
      ogImg.setAttribute("property", "og:image");
      ogImg.content = ogImage;
      document.head.appendChild(ogImg);
      tags.push(ogImg);
    }

    // OG URL
    const ogUrl = document.createElement("meta");
    ogUrl.setAttribute("property", "og:url");
    ogUrl.content = window.location.href;
    document.head.appendChild(ogUrl);
    tags.push(ogUrl);

    // Twitter card
    const twitterCard = document.createElement("meta");
    twitterCard.name = "twitter:card";
    twitterCard.content = "summary_large_image";
    document.head.appendChild(twitterCard);
    tags.push(twitterCard);

    // Canonical URL
    if (canonicalPath) {
      const link = document.createElement("link");
      link.rel = "canonical";
      link.href = `${window.location.origin}${canonicalPath}`;
      document.head.appendChild(link);
      tags.push(link);
    }

    return () => {
      tags.forEach(tag => {
        try { document.head.removeChild(tag); } catch {}
      });
    };
  }, [title, description, keywords, ogImage, ogType, canonicalPath]);
}
