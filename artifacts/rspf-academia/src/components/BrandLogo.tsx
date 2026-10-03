import { useEffect, useRef } from "react";

interface BrandLogoProps {
  src?: string | null;
  alt: string;
  className?: string;
  animationEnabled?: boolean;
  decorative?: boolean;
}

const STATIC_LOGO = "/srma-logo.jpg";
const isVideo = (src: string) => /\.(mp4|webm|mov|m4v)(?:$|[?#])/i.test(src);
const isAnimatedImage = (src: string) => /\.(gif|apng)(?:$|[?#])/i.test(src);

export default function BrandLogo({
  src,
  alt,
  className,
  animationEnabled = true,
  decorative = false,
}: BrandLogoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const logoSrc = src || STATIC_LOGO;
  const videoSource = isVideo(logoSrc);
  const animatedImage = isAnimatedImage(logoSrc);
  const prefersReducedMotion = typeof window !== "undefined"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const shouldAnimate = animationEnabled && !prefersReducedMotion;
  const imageAlt = decorative ? "" : alt;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!shouldAnimate) {
      video.pause();
      return;
    }
    void video.play().catch(() => undefined);
  }, [logoSrc, shouldAnimate]);

  if ((videoSource || animatedImage) && !shouldAnimate) {
    return <img src={STATIC_LOGO} alt={imageAlt} aria-hidden={decorative || undefined} className={className} />;
  }

  if (videoSource) {
    return (
      <video
        ref={videoRef}
        src={logoSrc}
        poster={STATIC_LOGO}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-label={decorative ? undefined : alt}
        aria-hidden={decorative || undefined}
        role={decorative ? undefined : "img"}
        className={className}
      />
    );
  }

  return <img src={logoSrc} alt={imageAlt} aria-hidden={decorative || undefined} className={className} />;
}