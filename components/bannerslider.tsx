// File: components/bannerslider.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import type { Banner } from "@/types";

const JEDA_MS = 5000;

// http/https dibuka sebagai <a> tab baru, path internal (mis. "/produk") sebagai <Link>.
const eksternal = (url: string) => /^https?:\/\//.test(url);

function Bingkai({
  href,
  children,
}: {
  href: string | null;
  children: ReactNode;
}) {
  const className = "block w-full shrink-0";
  if (!href) return <div className={className}>{children}</div>;
  if (eksternal(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export default function BannerSlider({ items }: { items: Banner[] }) {
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(false);
  const jumlah = items.length;

  // Auto-slide ke kiri. Berhenti sejenak saat kursor di atas banner.
  useEffect(() => {
    if (jumlah <= 1 || hover) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % jumlah), JEDA_MS);
    return () => clearInterval(timer);
  }, [jumlah, hover]);

  if (jumlah === 0) return null;

  return (
    <div
      className="group relative overflow-hidden rounded-2xl bg-line"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {items.map((item, i) => (
          <Bingkai key={item.id} href={item.link_url}>
            <div className="relative w-full h-[100px] sm:h-[250px]">
              <Image
                src={item.gambar_url}
                alt={item.judul ?? ""}
                fill
                unoptimized
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
              {item.judul && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-5 sm:p-8">
                  <p className="text-lg font-bold text-white sm:text-2xl">
                    {item.judul}
                  </p>
                </div>
              )}
            </div>
          </Bingkai>
        ))}
      </div>

      {jumlah > 1 && (
        <>
          <button
            type="button"
            aria-label="Banner sebelumnya"
            onClick={() => setIndex((i) => (i - 1 + jumlah) % jumlah)}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-ink/40 p-2 text-white opacity-0 transition hover:bg-ink/60 group-hover:opacity-100"
          >
            <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5l-5 5 5 5" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Banner berikutnya"
            onClick={() => setIndex((i) => (i + 1) % jumlah)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-ink/40 p-2 text-white opacity-0 transition hover:bg-ink/60 group-hover:opacity-100"
          >
            <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 5l5 5-5 5" />
            </svg>
          </button>

          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Ke banner ${i + 1}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className={`size-2 rounded-full transition ${
                  i === index ? "bg-white" : "bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}