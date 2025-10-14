"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavLinkProps = {
  href: string;
  children: React.ReactNode;
  isMobile?: boolean;
};

export function NavLink({ href, children, isMobile = false }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  if (isMobile) {
    return (
      <Link
        href={href}
        className={cn(
          "mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-sidebar-foreground hover:text-foreground",
          isActive && "bg-sidebar-accent text-primary"
        )}
      >
        {children}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:text-primary hover:bg-sidebar-accent",
        isActive && "bg-sidebar-accent text-primary"
      )}
    >
      {children}
    </Link>
  );
}
