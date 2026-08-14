"use client";

import { useEffect, useState } from "react";

/**
 * True only after hydration. Used to defer rendering of anything derived from
 * the browser's timezone, which the server cannot know.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
