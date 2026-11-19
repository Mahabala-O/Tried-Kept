"use client";

import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react";

/** An unavailable image still leaves a visual in its reserved space. */
export default function ResilientImage({ src, srcSet, fallbackSrc = "/media/tennis-court.svg", fallbackLabel, ...props }: ImgHTMLAttributes<HTMLImageElement> & { fallbackSrc?: string; fallbackLabel?: string }) {
  const [failedSrc, setFailedSrc] = useState<ImgHTMLAttributes<HTMLImageElement>["src"]>();
  const imageRef = useRef<HTMLImageElement>(null);
  const failed = failedSrc === src;
  // An SSR image can fail before hydration attaches onError. Check that case too.
  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth === 0) setFailedSrc(src);
  }, [src]);
  return <><img {...props} ref={imageRef} data-fallback={failed ? "true" : undefined} src={failed ? fallbackSrc : src} srcSet={failed ? undefined : srcSet}
    alt={failed ? "Tennis illustration; photo unavailable" : props.alt}
    onError={failed ? undefined : () => setFailedSrc(src)} />
    {failed && fallbackLabel && <span className="art-label">{fallbackLabel}</span>}</>;
}
