"use client";

import { useEffect } from "react";
import { captureSource } from "@/lib/source";

/** Renders nothing. Reads ?src= once per page load and keeps it only if it's on the fixed list. */
export default function SourceCapture() {
  useEffect(() => {
    captureSource(window.location.search);
  }, []);
  return null;
}
