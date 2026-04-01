import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://todohogarfactory.es",
      lastModified: new Date(),
    },
    {
      url: "https://todohogarfactory.es/contacto",
      lastModified: new Date(),
    },
  ];
}