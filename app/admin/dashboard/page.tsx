// File: app/admin/dashboard/page.tsx
import Link from "next/link";
import ProdukTable from "@/components/produktable";
import { buttonClass, Container } from "@/components/ui";
import { getKategori, getSemuaProduk } from "@/lib/db";

export const dynamic = "force-dynamic";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-line p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-ink">{value}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const [produk, kategori] = await Promise.all([getSemuaProduk(), getKategori()]);

  const total = produk.length;
  const tampil = produk.filter((p) => p.is_available).length;

  // Hanya field yang dibutuhkan tabel yang dioper ke client component.
  const rows = produk.map((p) => ({
    id: p.id,
    nama: p.nama,
    gambar_url: p.gambar_url,
    kategori_nama: p.kategori_nama,
    harga: p.harga,
    is_available: p.is_available,
  }));

  return (
    <main className="py-8">
      <Container>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-ink">Produk</h1>
            <p className="mt-1 text-sm text-muted">
              Kelola produk yang tampil di toko.
            </p>
          </div>
          <Link href="/admin/dashboard/add" className={buttonClass("primary")}>
            Tambah produk
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total produk" value={total} />
          <StatCard label="Tampil di toko" value={tampil} />
          <StatCard label="Disembunyikan" value={total - tampil} />
          <StatCard label="Kategori" value={kategori.length} />
        </div>

        <div className="mt-8">
          {total === 0 ? (
            <div className="rounded-xl border border-dashed border-line py-16 text-center">
              <p className="text-muted">Belum ada produk.</p>
              <Link
                href="/admin/dashboard/add"
                className={buttonClass("primary", "mt-4")}
              >
                Tambah produk pertama
              </Link>
            </div>
          ) : (
            <ProdukTable rows={rows} />
          )}
        </div>
      </Container>
    </main>
  );
}