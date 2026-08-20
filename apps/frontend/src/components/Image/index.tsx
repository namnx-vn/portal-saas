import type { ImgHTMLAttributes } from "react";
import * as imgs from "../../assets";

export type ImageKey = keyof typeof imgs;

interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: ImageKey;
  webp?: ImageKey;
  alt: string;
}

export default function Image({ src, webp, alt, loading = "lazy", ...rest }: ImageProps) {
  if (!webp) {
    return <img src={imgs[src]} alt={alt} loading={loading} {...rest} />;
  }

  return (
    <picture>
      <source srcSet={imgs[webp]} type="image/webp" />
      <img src={imgs[src]} alt={alt} loading={loading} {...rest} />
    </picture>
  );
}