// File: components/produkgaleri.tsx
"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { ProdukGambar } from "@/types";
import { Button } from "./ui";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const MAX_VIDEO_SIZE = 20 * 1024 * 1024;

function cekUkuran(file: File): string | null {
  const video = file.type.startsWith("video/");
  const batas = video ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  if (file.size > batas) {
    return video ? "Setiap video maksimal 20 MB" : "Setiap gambar maksimal 2 MB";
  }
  return null;
}

export default function ProdukGaleri({
  produkId,
  items: initialItems,
}: {
  produkId: number;
  items: ProdukGambar[];
}) {
  const [items, setItems] = useState(initialItems);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function tambah() {
    const files = inputRef.current?.files;
    if (!files || files.length === 0) return;
    for (const file of files) {
      const err = cekUkuran(file);
      if (err) {
        setError(err);
        return;
      }
    }

    setError("");
    setBusy(true);
    const formData = new FormData();
    for (const file of files) formData.append("media", file);

    try {
      const res = await fetch(`/api/produk/${produkId}/gambar`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Gagal mengunggah berkas");
        return;
      }
      const baru: ProdukGambar[] = await res.json();
      setItems((prev) => [...prev, ...baru]);
      if (inputRef.current) inputRef.current.value = "";
    } catch {
      setError("Tidak bisa terhubung ke server");
    } finally {
      setBusy(false);
    }
  }

  async function hapus(id: number) {
    if (!confirm("Hapus berkas ini?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/produk/${produkId}/gambar/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error ?? "Gagal menghapus berkas");
        return;
      }
      setItems((prev) => prev.filter((i) => i.id !== id));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <span className="mb-1 block text-sm font-medium text-ink">
        Galeri tambahan (opsional, gambar atau video)
      </span>

      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-line bg-line"
            >
              {item.tipe === "video" ? (
                <video
                  src={item.gambar_url}
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : (
                <Image
                  src={item.gambar_url}
                  alt=""
                  fill
                  unoptimized
                  sizes="150px"
                  className="object-cover"
                />
              )}
              {item.tipe === "video" && (
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="size-8 text-white drop-shadow" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={() => hapus(item.id)}
                aria-label="Hapus berkas"
                className="absolute right-1 top-1 rounded-full bg-ink/70 p-1 text-white opacity-0 transition group-hover:opacity-100 disabled:opacity-50"
              >
                <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 6l8 8M14 6l-8 8" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
          multiple
          className="text-sm text-muted"
        />
        <Button type="button" variant="outline" disabled={busy} onClick={tambah}>
          {busy ? "Mengunggah..." : "Tambah berkas"}
        </Button>
      </div>

      {error && <p role="alert" className="text-sm font-medium text-brand">{error}</p>}
    </div>
  );
}