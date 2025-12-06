"use client";

export interface SkeletonLoaderProps {
  type?: "card" | "text" | "avatar" | "line" | "grid";
  count?: number;
  className?: string;
}

export function SkeletonLoader({
  type = "card",
  count = 1,
  className = "",
}: SkeletonLoaderProps) {
  const baseClasses = "animate-pulse-soft bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded";

  const renderSkeleton = () => {
    switch (type) {
      case "card":
        return (
          <div className={`${baseClasses} h-64 w-full ${className}`} />
        );
      case "text":
        return (
          <div className={`${baseClasses} h-4 w-full ${className}`} />
        );
      case "avatar":
        return (
          <div className={`${baseClasses} h-12 w-12 rounded-full ${className}`} />
        );
      case "line":
        return (
          <div className={`${baseClasses} h-2 w-full ${className}`} />
        );
      case "grid":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className={`${baseClasses} h-40 w-full ${className}`} />
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  if (type === "grid") {
    return renderSkeleton();
  }

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </>
  );
}
