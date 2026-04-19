"use client";

import { useEffect } from "react";
import { recordView } from "@/lib/recently-viewed";

/**
 * Client beacon that records the current product slug in the user's local
 * "recently viewed" stack. Mount once per PDP.
 */
export function TrackRecentlyViewed({ slug }: { slug: string }) {
  useEffect(() => {
    recordView(slug);
  }, [slug]);
  return null;
}
