"use client";

import { useCart } from "./CartProvider";

export default function CartCount() {
  const { count, ready } = useCart();
  if (!ready || count === 0) return null;
  return (
    <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-brass px-1 text-[11px] font-bold text-ink tabular-nums">
      {count > 99 ? "99+" : count}
    </span>
  );
}
