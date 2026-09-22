// File: components/produkform.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { Kategori } from "@/types";
import { Button, buttonClass, Field, Input, Select, Textarea } from "./ui";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

// Data awal untuk mode edit (hanya field yang dibutuhkan form).
export type ProdukAwal = {
  id: number;
  nama: string;
  kategori_id: number | null;
  deskripsi: string | null;
  harga: number;
  gambar_url: string;
  shopee_url: string | null;
  is_available: boolean;
};

export default function ProdukForm({
  kategori,
  produk,
}: {
  kategori: Kategori[];
  produk?: ProdukAwal; // ada = mode edit, tidak ada = tambah baru
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    // Karena ada file, kirim sebagai multipart/form-data lewat FormData.
    const formData = new FormData(e.currentTarget);

    const gambar = formData.get("gambar");
    if (gambar instanceof File && gambar.size > MAX_IMAGE_SIZE) {
      setError("Ukuran gambar maksimal 2 MB");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        produk ? `/api/produk/${produk.id}` : "/api/produk",
        { method: produk ? "PUT" : "POST", body: formData },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Gagal menyimpan produk");
        return;
      }
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Nama produk">
        <Input name="nama" required maxLength={150} defaultValue={produk?.nama} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Harga (Rp)">
          <Input
            name="harga"
            type="number"
            min={0}
            step={1}
            required
            defaultValue={produk?.harga}
          />
        </Field>
        <div>
          <Field label="Kategori">
            <Select name="kategori_id" defaultValue={produk?.kategori_id ?? ""}>
              <option value="">Tanpa kategori</option>
              {kategori.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama}
                </option>
              ))}
            </Select>
          </Field>
          <Link
            href="/admin/dashboard/kategori"
            className="mt-1 inline-block text-xs text-muted underline hover:text-ink"
          >
            Kelola kategori
          </Link>
        </div>
      </div>

      <Field label="Deskripsi">
        <Textarea name="deskripsi" rows={5} defaultValue={produk?.deskripsi ?? ""} />
      </Field>

      {produk && (
        <div className="flex items-center gap-3">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-line">
            <Image
              src={produk.gambar_url}
              alt="Gambar saat ini"
              fill
              unoptimized
              sizes="80px"
              className="object-cover"
            />
          </div>
          <span className="text-sm text-muted">Gambar saat ini</span>
        </div>
      )}

      <Field
        label={produk ? "Ganti gambar" : "Gambar produk"}
        hint={
          produk
            ? "Kosongkan jika tidak ingin mengganti. JPG, PNG, atau WebP, maksimal 2 MB."
            : "JPG, PNG, atau WebP. Maksimal 2 MB."
        }
      >
        <Input
          name="gambar"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required={!produk}
        />
      </Field>

      <Field label="Link Shopee" hint="Kosongkan jika produk belum ada di Shopee.">
        <Input
          name="shopee_url"
          type="url"
          maxLength={255}
          placeholder="https://shopee.co.id/..."
          defaultValue={produk?.shopee_url ?? ""}
        />
      </Field>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          name="is_available"
          defaultChecked={produk ? produk.is_available : true}
          className="size-4 accent-brand"
        />
        Tampilkan di toko
      </label>

      {error && (
        <p role="alert" className="text-sm font-medium text-brand">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Menyimpan..." : produk ? "Simpan perubahan" : "Simpan produk"}
        </Button>
        <Link href="/admin/dashboard" className={buttonClass("outline")}>
          Batal
        </Link>
      </div>
    </form>
  );
}