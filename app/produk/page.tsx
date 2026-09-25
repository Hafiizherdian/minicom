// File: app/produk/page.tsx
import Link from "next/link";
import ProdukCard from "@/components/produkcard";
import ProdukFilter, { type Urutan } from "@/components/produkfilter";
import { Container, SiteFooter, SiteHeader } from "@/components/ui";
import { getKategori, getProdukTersedia } from "@/lib/db";

// Data produk berubah dari admin, dan build tidak boleh membutuhkan koneksi DB.
export const dynamic = "force-dynamic";

type Param = string | string[] | undefined;

const URUTAN: Urutan[] = ["terbaru", "termurah", "termahal"];
const MAKS_HARGA = 2_000_000_000; // di bawah batas INTEGER Postgres (2,147,483,647)
const BASE_PATH = "/produk";

const satu = (v: Param) => (Array.isArray(v) ? v[0] : v);

function angka(v: Param) {
  const s = satu(v);
  if (!s) return undefined;
  const n = Number(s);
  return Number.isInteger(n) && n >= 0 && n <= MAKS_HARGA ? n : undefined;
}

export default async function ProdukListPage({
  searchParams,
}: {
  searchParams: Promise<{
    kategori?: Param;
    min?: Param;
    max?: Param;
    urut?: Param;
  }>;
}) {
  const sp = await searchParams;

  // Semua input dari URL divalidasi dulu sebelum masuk ke query.
  const kategoriSlug = satu(sp.kategori) || undefined;
  const min = angka(sp.min);
  const max = angka(sp.max);
  const urutRaw = satu(sp.urut);
  const urut: Urutan = URUTAN.includes(urutRaw as Urutan)
    ? (urutRaw as Urutan)
    : "terbaru";

  const adaFilter =
    Boolean(kategoriSlug) ||
    min !== undefined ||
    max !== undefined ||
    urut !== "terbaru";

  // Query langsung di server, hasilnya dirender jadi HTML.
  const [produk, daftarKategori] = await Promise.all([
    getProdukTersedia({ kategori: kategoriSlug, min, max, urut }),
    getKategori(),
  ]);

  const namaKategori = daftarKategori.find((k) => k.slug === kategoriSlug)?.nama;
  const filterProps = { kategori: daftarKategori, aktif: kategoriSlug, min, max, urut };

  return (
    <>
      <SiteHeader />

      {/* Tablet & desktop: rail filter menempel di tepi kiri layar, konten di kanan.
          Mobile: kolom biasa, filter jadi panel buka-tutup. */}
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Mobile */}
        <details className="mx-4 mt-4 rounded-xl border border-line p-4 sm:mx-6 md:hidden">
          <summary className="cursor-pointer text-sm font-semibold text-ink">
            Filter{adaFilter ? " (aktif)" : ""}
          </summary>
          <div className="mt-4">
            <ProdukFilter {...filterProps} basePath={BASE_PATH} />
          </div>
        </details>

        {/* Tablet & desktop: aside setinggi konten, isinya sticky supaya ikut
            terlihat saat scroll */}
        <aside className="hidden md:block md:w-60 md:shrink-0 md:border-r md:border-line lg:w-64">
          <div className="md:sticky md:top-0 md:max-h-screen md:overflow-y-auto md:p-6">
            <ProdukFilter {...filterProps} basePath={BASE_PATH} />
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <section id="produk" className="scroll-mt-6">
            <div className="flex items-baseline justify-between gap-4">
              <h1 className="text-3xl font-bold tracking-tight text-ink">
                {namaKategori ?? "Semua produk"}
              </h1>
              <p className="shrink-0 text-sm text-muted">{produk.length} produk</p>
            </div>

            {produk.length === 0 ? (
              <div className="mt-16 text-center text-muted">
                <p>
                  {adaFilter
                    ? "Tidak ada produk yang cocok dengan filter ini."
                    : "Belum ada produk."}
                </p>
                {adaFilter && (
                  <Link
                    href={BASE_PATH}
                    className="mt-2 inline-block underline hover:text-ink"
                  >
                    Reset filter
                  </Link>
                )}
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {produk.map((p) => (
                  <ProdukCard key={p.id} produk={p} />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      <SiteFooter />
    </>
  );
}