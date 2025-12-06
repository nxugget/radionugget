import type { ReactNode } from "react";
import Head from "./head";

export default async function ToolsLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;

  return (
    <>
      <Head params={resolvedParams} />
      <main>
        {children}
      </main>
    </>
  );
}
