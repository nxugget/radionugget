"use client";
import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";

export default function SmartLink({ slug, children, className, ...props }) {
  const pathname = usePathname();
  const currentLocale = pathname.split("/")[1] || "en";
  return (
    <Link
      href={`/${currentLocale}/blog/${slug}`}
      className={clsx("text-purple transition-colors duration-300 hover:text-[#8000bf]", className)}
      {...props}
    >
      {children}
    </Link>
  );
}
