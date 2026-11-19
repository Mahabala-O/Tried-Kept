"use client";

import { useState, type ImgHTMLAttributes } from "react";

/** An unavailable image still leaves a visual in its reserved space. */
export default function ResilientImage({ src, srcSet, fallbackSrc = "/media/tennis-court.svg", ...props }: ImgHTMLAttributes<HTMLImageElement> & { fallbackSrc?: string }) {
  const [failedSrc, setFailedSrc] = useState<ImgHTMLAttributes<HTMLImageElement>["src"]>();
  const failed = failedSrc === src;
  return <img {...props} src={failed ? fallbackSrc : src} srcSet={failed ? undefined : srcSet}
    alt={failed ? "Tennis illustration; photo unavailable" : props.alt}
    onError={failed ? undefined : () => setFailedSrc(src)} />;
}
