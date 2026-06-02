import type { MetadataRoute } from "next";
import { SITE_AUTHOR } from "@/lib/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_AUTHOR} | Frontend Developer`,
    short_name: SITE_AUTHOR,
    description:
      "Frontend developer portfolio — I craft web experiences that just work.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      {
        // Dynamic favicon route (app/icon.tsx). Sufficient for metadata;
        // add 192/512 PNGs later for full PWA installability.
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
    ],
  };
}
