// File: components/kategorimanager.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, Input } from "./ui";

type Item = { id: number; nama: string; slug: string; jumlah: number };

const JSON_HEADERS = { "Content-Type": "application/json" };

export default function KategoriManager({ items }: { items: Item[] }) {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editNama, setEditNama] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Mengembalikan true kalau berhasil.
  async function kirim(url: string, init: RequestInit) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(url, init);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Gagal memproses permintaan");
        return false;
      }
      router.refresh();
      return true;
    } catch {
      setError("Tidak bisa terhubung ke server");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function tambah(e: FormEvent) {
    e.preventDefault();
    const ok = await kirim("/api/kategori", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ nama }),
    });
    if (ok) setNama("");
  }

  async function simpan(id: number) {
    const ok = await kirim(`/api/kategori/${id}`, {
      method: "PATCH",
      headers: JSON_HEADERS,
      body: JSON.stringify({ nama: editNama }),
    });
    if (ok) setEditId(null);
  }

  function hapus(item: Item) {
    const info =
      item.jumlah > 0
        ? ` ${item.jumlah} produk di dalamnya akan menjadi tanpa kategori.`
        : "";
    if (confirm(`Hapus kategori "${item.nama}"?${info}`)) {
      kirim(`/api/kategori/${item.id}`, { method: "DELETE" });
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={tambah} className="flex gap-2">
        <Input
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Nama kategori baru"
          maxLength={100}
          aria-label="Nama kategori baru"
          required
        />
        <Button type="submit" disabled={busy} className="shrink-0">
          Tambah
        </Button>
      </form>

      {error && (
        <p role="alert" className="text-sm font-medium text-brand">
          {error}
        </p>
      )}

      {items.length === 0 ? (
        <p className="py-10 text-center text-muted">
          Belum ada kategori. Tambahkan yang pertama di atas.
        </p>
      ) : (
        <ul className="divide-y divide-line rounded-xl border border-line">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              {editId === item.id ? (
                <>
                  <div className="min-w-40 flex-1">
                    <Input
                      value={editNama}
                      onChange={(e) => setEditNama(e.target.value)}
                      maxLength={100}
                      aria-label={`Nama baru untuk ${item.nama}`}
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button disabled={busy} onClick={() => simpan(item.id)}>
                      Simpan
                    </Button>
                    <Button variant="outline" onClick={() => setEditId(null)}>
                      Batal
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="min-w-40 flex-1">
                    <p className="font-medium text-ink">{item.nama}</p>
                    <p className="text-xs text-muted">
                      {item.jumlah} produk &middot; /{item.slug}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      disabled={busy}
                      onClick={() => {
                        setEditId(item.id);
                        setEditNama(item.nama);
                        setError("");
                      }}
                    >
                      Ubah nama
                    </Button>
                    <Button variant="danger" disabled={busy} onClick={() => hapus(item)}>
                      Hapus
                    </Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}