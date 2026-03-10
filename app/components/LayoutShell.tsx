"use client";

import { usePathname } from "next/navigation";

type LayoutShellProps = Readonly<{
  children: React.ReactNode;
  footer: React.ReactNode;
}>;

export default function LayoutShell({ children, footer }: LayoutShellProps) {
  const pathname = usePathname();
  const hideFooter = pathname.startsWith("/chat");

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">{children}</main>
      {!hideFooter && footer}
    </div>
  );
}