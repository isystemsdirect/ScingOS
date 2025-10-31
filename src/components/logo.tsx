import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

const Logo = ({ className }: { className?: string }) => {
  return (
    <Link
      href="/dashboard"
      className={cn(
        "flex items-center gap-2 text-xl font-bold text-foreground",
        className
      )}
    >
      <Image src="/logo.png" alt="Scingular Logo" width={40} height={40} />
      <span className="font-sans uppercase font-bold italic">
        SCINGULAR <span className="text-primary">AI</span>
      </span>
    </Link>
  );
};

export default Logo;
