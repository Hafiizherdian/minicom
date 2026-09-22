// File: components/produkfilter.tsx
import Link from "next/link";
import type { Kategori } from "@/types";
import { Button, Field, Input, Select } from "./ui";

export type Urutan = "terbaru" | "termurah" | "termahal";

type Props = {
  kategori: Kategori[];
  aktif?: string; // slug kategori yang sedang dipilih
  min?: number;
  max?: number;
  urut: Urutan;
};

// Membuat URL "/?kategori=..&min=..", parameter kosong dibuang.
function buildHref(p: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(p)) {
    if (value !== undefined && value !== "") sp.set(key, String(value));
  }
  const qs = sp.toString();
  return qs ? `/?${qs}` : "/";
}

export default function ProdukFilter({ kategori, aktif, min, max, urut }: Props) {
  const adaFilter =
    Boolean(aktif) || min !== undefined || max !== undefined || urut !== "terbaru";

  // Pindah kategori tanpa menghapus filter harga dan urutan.
  const hrefKategori = (slug?: string) =>
    buildHref({
      kategori: slug,
      min,
      max,
      urut: urut === "terbaru" ? undefined : urut,
    });

  const item = (dipilih: boolean) =>
    `block rounded-lg px-3 py-2 text-sm transition ${
      dipilih
        ? "bg-ink font-semibold text-white"
        : "text-muted hover:bg-line/50 hover:text-ink"
    }`;

  return (
    <div className="space-y-6">
      {kategori.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-ink">Kategori</h3>
          <ul className="space-y-1">
            <li>
              <Link href={hrefKategori()} className={item(!aktif)}>
                Semua
              </Link>
            </li>
            {kategori.map((k) => (
              <li key={k.id}>
                <Link href={hrefKategori(k.slug)} className={item(aktif === k.slug)}>
                  {k.nama}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Form GET biasa: tidak butuh JavaScript, hasilnya jadi query string di URL. */}
      <form action="/" method="get" className="space-y-4">
        {aktif && <input type="hidden" name="kategori" value={aktif} />}

        <section>
          <h3 className="mb-2 text-sm font-semibold text-ink">Harga (Rp)</h3>
          <div className="flex items-center gap-2">
            <Input
              name="min"
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="Min"
              aria-label="Harga minimum"
              defaultValue={min}
            />
            <span className="text-muted">-</span>
            <Input
              name="max"
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="Maks"
              aria-label="Harga maksimum"
              defaultValue={max}
            />
          </div>
        </section>

        <Field label="Urutkan">
          <Select name="urut" defaultValue={urut}>
            <option value="terbaru">Terbaru</option>
            <option value="termurah">Harga terendah</option>
            <option value="termahal">Harga tertinggi</option>
          </Select>
        </Field>

        <Button type="submit" variant="dark" className="w-full">
          Terapkan
        </Button>
      </form>

      {adaFilter && (
        <Link
          href="/"
          className="block text-center text-sm text-muted underline hover:text-ink"
        >
          Reset filter
        </Link>
      )}
    </div>
  );
}