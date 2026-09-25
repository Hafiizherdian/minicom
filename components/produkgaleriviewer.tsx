// File: components/produkgaleriviewer.tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProdukGambar } from "@/types";

type ItemGaleri = { gambar_url: string; tipe: "image" | "video" };

export default function ProdukGaleriViewer({
  nama,
  gambarUtama,
  galeri,
}: {
  nama: string;
  gambarUtama: string;
  galeri: ProdukGambar[];
}) {
  const semua: ItemGaleri[] = [
    { gambar_url: gambarUtama, tipe: "image" },
    ...galeri.map((g) => ({ gambar_url: g.gambar_url, tipe: g.tipe })),
  ];
  const [aktif, setAktif] = useState(0);
  const item = semua[aktif];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-xl border border-line bg-line">
        {item.tipe === "video" ? (
          <video
            key={item.gambar_url}
            src={item.gambar_url}
            controls
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <Image
            src={item.gambar_url}
            alt={nama}
            fill
            unoptimized
            priority={aktif === 0}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        )}
      </div>

      {semua.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {semua.map((m, i) => (
            <button
              key={`${m.gambar_url}-${i}`}
              type="button"
              onClick={() => setAktif(i)}
              aria-current={i === aktif}
              aria-label={`Lihat media ${i + 1}`}
              className={`relative size-16 shrink-0 overflow-hidden rounded-lg border-2 bg-line transition ${
                i === aktif ? "border-brand" : "border-transparent hover:border-line"
              }`}
            >
              {m.tipe === "video" ? (
                <video src={m.gambar_url} muted playsInline className="h-full w-full object-cover" />
              ) : (
                <Image src={m.gambar_url} alt="" fill unoptimized sizes="64px" className="object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}