"use client";
import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import React from "react";

export default function SmartLink({ slug, children, className, ...props }) {
  const pathname = usePathname();
  const currentLocale = pathname.split("/")[1] || "en";

  // Filtrer les enfants pour éviter les balises non valides
  const validChildren = React.Children.toArray(children).filter(
    (child) => typeof child === "string" || typeof child === "number"
  );

  return (
    <Link
      href={`/${currentLocale}/blog/${slug}`}
      className={clsx("text-purple transition-colors duration-300 hover:text-[#8000bf]", className)}
      {...props}
    >
      {validChildren}
    </Link>
  );
}
