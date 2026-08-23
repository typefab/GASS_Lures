import { site } from "@/lib/site";

export default function Logo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
        <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeWidth="2" strokeOpacity="0.35" />
        <path
          d="M9 24 C 14 16 24 13 32 15 L 41 9 L 38 24 L 41 39 L 32 33 C 24 35 14 32 9 24 Z"
          fill="currentColor"
        />
        <circle cx="17" cy="22" r="3" fill="var(--color-ink)" />
      </svg>
      <span className="h-display text-xl leading-none tracking-tight">{site.name}</span>
    </span>
  );
}
