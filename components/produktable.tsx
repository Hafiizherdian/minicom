// File: components/produktable.tsx
"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ProdukActions } from "./adminactions";
import { Input, rupiah, Select } from "./ui";

export type BarisProduk = {
  id: number;
  nama: string;
  gambar_url: string;
  kategori_nama: string | null;
  harga: number;
  is_available: boolean;
};

type Status = "semua" | "tampil" | "sembunyi";
const TANPA = "__tanpa__";

function Thumb({ src, className }: { src: string; className: string }) {
  return (
    <div className={`relative shrink-0 overflow-hidden rounded-lg bg-line ${className}`}>
      <Image src={src} alt="" fill unoptimized sizes="64px" className="object-cover" />
    </div>
  );
}

function StatusBadge({ aktif }: { aktif: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        aktif ? "bg-brand/10 text-brand" : "bg-line text-muted"
      }`}
    >
      {aktif ? "Tampil" : "Disembunyikan"}
    </span>
  );
}

export default function ProdukTable({ rows }: { rows: BarisProduk[] }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<Status>("semua");
  const [kategori, setKategori] = useState("semua");

  const daftarKategori = useMemo(
    () =>
      [
        ...new Set(
          rows.map((r) => r.kategori_nama).filter((k): k is string => Boolean(k)),
        ),
      ].sort(),
    [rows],
  );

  const hasil = useMemo(() => {
    const kata = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (kata && !r.nama.toLowerCase().includes(kata)) return false;
      if (status === "tampil" && !r.is_available) return false;
      if (status === "sembunyi" && r.is_available) return false;
      if (kategori === TANPA && r.kategori_nama !== null) return false;
      if (kategori !== "semua" && kategori !== TANPA && r.kategori_nama !== kategori) {
        return false;
      }
      return true;
    });
  }, [rows, q, status, kategori]);

  const adaFilter = q !== "" || status !== "semua" || kategori !== "semua";
  const reset = () => {
    setQ("");
    setStatus("semua");
    setKategori("semua");
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="sm:flex-1">
          <Input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama produk"
            aria-label="Cari produk"
          />
        </div>
        <div className="sm:w-44">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            aria-label="Filter status"
          >
            <option value="semua">Semua status</option>
            <option value="tampil">Tampil</option>
            <option value="sembunyi">Disembunyikan</option>
          </Select>
        </div>
        <div className="sm:w-44">
          <Select
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            aria-label="Filter kategori"
          >
            <option value="semua">Semua kategori</option>
            {daftarKategori.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
            <option value={TANPA}>Tanpa kategori</option>
          </Select>
        </div>
      </div>

      <div className="mb-3 mt-3 flex items-center justify-between text-sm text-muted">
        <span>
          Menampilkan {hasil.length} dari {rows.length} produk
        </span>
        {adaFilter && (
          <button type="button" onClick={reset} className="underline hover:text-ink">
            Reset filter
          </button>
        )}
      </div>

      {hasil.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line py-16 text-center text-muted">
          Tidak ada produk yang cocok dengan filter ini.
        </div>
      ) : (
        <>
          {/* Layar lebar: tabel */}
          <div className="hidden overflow-hidden rounded-xl border border-line xl:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-line/50 text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Produk</th>
                  <th className="px-4 py-3 font-medium">Kategori</th>
                  <th className="px-4 py-3 font-medium">Harga</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {hasil.map((r) => (
                  <tr key={r.id} className="hover:bg-line/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Thumb src={r.gambar_url} className="size-12" />
                        <span className="max-w-64 truncate font-medium text-ink">
                          {r.nama}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">{r.kategori_nama ?? "-"}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-ink">
                      {rupiah(r.harga)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge aktif={r.is_available} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <ProdukActions id={r.id} isAvailable={r.is_available} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Layar kecil dan sedang: kartu */}
          <ul className="space-y-3 xl:hidden">
            {hasil.map((r) => (
              <li key={r.id} className="rounded-xl border border-line p-4">
                <div className="flex gap-3">
                  <Thumb src={r.gambar_url} className="size-16" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{r.nama}</p>
                    <p className="text-sm text-muted">
                      {r.kategori_nama ?? "Tanpa kategori"}
                    </p>
                    <p className="mt-1 font-semibold text-brand">{rupiah(r.harga)}</p>
                  </div>
                  <StatusBadge aktif={r.is_available} />
                </div>
                <div className="mt-3 border-t border-line pt-3">
                  <ProdukActions id={r.id} isAvailable={r.is_available} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}