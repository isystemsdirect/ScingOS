import { cn } from "@/lib/utils";
import Link from "next/link";

const Logo = ({ className }: { className?: string }) => {
  return (
    <Link
      href="/dashboard"
      className={cn(
        "flex items-center gap-2 text-lg font-bold text-foreground",
        className
      )}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary"
      >
        <g transform="translate(0, 4)">
          <path
            d="M 95,50 A 45,45 0 1 1 5,50 A 45,45 0 1 1 95,50"
            fill="none"
            stroke="#0d47a1"
            strokeWidth="8"
          />

          <path
            d="M 68,15 A 35,35 0 0 1 85,50"
            fill="none"
            stroke="#fb8c00"
            strokeWidth="15"
            strokeLinecap="round"
          />

          <path
            d="M 50,85 A 35,35 0 0 1 15,50"
            fill="none"
            stroke="#0d47a1"
            strokeWidth="15"
            strokeLinecap="round"
          />

          <path
            d="M 32,15 A 35,35 0 0 0 15,50"
            fill="none"
            stroke="#2e7d32"
            strokeWidth="15"
            strokeLinecap="round"
          />

          <g fill="white" stroke="white" strokeWidth="1" strokeLinecap="round">
            <circle cx="70" cy="22" r="2" />
            <path d="M 70,22 Q 76,36 81,42" fill="none" stroke="white" strokeWidth="1.5" />
            <circle cx="81" cy="42" r="2" />

            <circle cx="24" cy="62" r="2" />
            <path d="M 24,62 Q 34,58 40,55" fill="none" stroke="white" strokeWidth="1.5" />
            <circle cx="40" cy="55" r="2" />

            <circle cx="38" cy="24" r="2" />
            <path d="M 38,24 Q 28,34 24,44" fill="none" stroke="white" strokeWidth="1.5" />
            <circle cx="24" cy="44" r="2" />
          </g>
          <text
            x="88"
            y="22"
            fontFamily="sans-serif"
            fontSize="10"
            fill="#0d47a1"
          >
            TM
          </text>
        </g>
      </svg>
      <span className="font-headline">Scingular</span>
    </Link>
  );
};

export default Logo;
