import React from "react";

type PlainImgProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  alt: string;
};

export default function PlainImg({ src, alt, className, style, ...rest }: PlainImgProps) {
  return (
    // Simple <img> to avoid Next.js on-demand optimization
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading={rest.loading ?? "lazy"}
      decoding={rest.decoding ?? "async"}
      {...rest}
    />
  );
}
