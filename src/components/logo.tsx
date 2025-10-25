import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

const Logo = ({ className }: { className?: string }) => {
  return (
    <Link
      href="/dashboard"
      className={cn(
        "flex items-center gap-2 text-lg font-bold text-foreground",
        className
      )}
    >
      <Image src="/logo.png" alt="Scingular Logo" width={32} height={32} />
      <span className="font-sans uppercase font-bold">SCINGULAR AI</span>
    </Link>
  );
};

export default Logo;
