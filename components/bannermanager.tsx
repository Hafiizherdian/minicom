// File: components/bannermanager.tsx
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import type { Banner } from "@/types";
import { Button, Field, Input } from "./ui";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const JSON_HEADERS = { "Content-Type": "application/json" };

export default function BannerManager({ items }: { items: Banner[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function tambah(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const gambar = formData.get("gambar");
    if (gambar instanceof File && gambar.size > MAX_IMAGE_SIZE) {
      setError("Ukuran gambar maksimal 2 MB");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/banner", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Gagal menyimpan banner");
        return;
      }
      formRef.current?.reset();
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server");
    } finally {
      setBusy(false);
    }
  }

  async function pindah(id: number, arah: "naik" | "turun") {
    setBusy(true);
    try {
      await fetch(`/api/banner/${id}`, {
        method: "PATCH",
        headers: JSON_HEADERS,
        body: JSON.stringify({ arah }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function hapus(id: number) {
    if (!confirm("Hapus banner ini?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/banner/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error ?? "Gagal menghapus banner");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <form
        ref={formRef}
        onSubmit={tambah}
        className="space-y-4 rounded-xl border border-line p-4"
      >
        <Field
          label="Gambar banner"
          hint="JPG, PNG, atau WebP, maksimal 2 MB. Gambar lebar cocok, mis. 1600x600."
        >
          <Input
            name="gambar"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
          />
        </Field>
        <Field label="Judul (opsional)" hint="Ditampilkan di atas gambar.">
          <Input name="judul" maxLength={150} />
        </Field>
        <Field
          label="Link tujuan (opsional)"
          hint="Dibuka saat banner diklik, mis. link Shopee atau /produk?kategori=..."
        >
          <Input name="link_url" placeholder="https://shopee.co.id/... atau /produk" />
        </Field>

        {error && (
          <p role="alert" className="text-sm font-medium text-brand">
            {error}
          </p>
        )}

        <Button type="submit" disabled={busy}>
          {busy ? "Menyimpan..." : "Tambah banner"}
        </Button>
      </form>

      {items.length === 0 ? (
        <p className="py-10 text-center text-muted">
          Belum ada banner. Selama belum ada, landing page menampilkan banner teks
          bawaan.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item, i) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-line p-3"
            >
              <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-line">
                <Image
                  src={item.gambar_url}
                  alt=""
                  fill
                  unoptimized
                  sizes="112px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-40 flex-1">
                <p className="font-medium text-ink">{item.judul || "Tanpa judul"}</p>
                {item.link_url && (
                  <p className="truncate text-xs text-muted">{item.link_url}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  disabled={busy || i === 0}
                  onClick={() => pindah(item.id, "naik")}
                >
                  Naik
                </Button>
                <Button
                  variant="outline"
                  disabled={busy || i === items.length - 1}
                  onClick={() => pindah(item.id, "turun")}
                >
                  Turun
                </Button>
                <Button variant="danger" disabled={busy} onClick={() => hapus(item.id)}>
                  Hapus
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}