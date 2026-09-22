// File: app/admin/dashboard/edit/[id]/page.tsx
import { notFound } from "next/navigation";
import ProdukForm from "@/components/produkform";
import { BackButton, Container } from "@/components/ui";
import { getKategori, getProdukById } from "@/lib/db";
import { parseId } from "@/lib/validasi";

export const dynamic = "force-dynamic";

export default async function EditProdukPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = parseId((await params).id);
  if (id === null) notFound();

  const [produk, kategori] = await Promise.all([getProdukById(id), getKategori()]);
  if (!produk) notFound();

  return (
    <main className="py-8">
      <Container>
        <div className="mx-auto max-w-2xl">
          <BackButton href="/admin/dashboard">Kembali ke daftar produk</BackButton>
          <h1 className="mb-6 mt-4 text-2xl font-bold text-ink">Edit produk</h1>
          {/* Hanya field yang dibutuhkan form yang dioper ke client component */}
          <ProdukForm
            kategori={kategori}
            produk={{
              id: produk.id,
              nama: produk.nama,
              kategori_id: produk.kategori_id,
              deskripsi: produk.deskripsi,
              harga: produk.harga,
              gambar_url: produk.gambar_url,
              shopee_url: produk.shopee_url,
              is_available: produk.is_available,
            }}
          />
        </div>
      </Container>
    </main>
  );
}