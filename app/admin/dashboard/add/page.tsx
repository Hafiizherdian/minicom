// File: app/admin/dashboard/add/page.tsx
import ProdukForm from "@/components/produkform";
import { BackButton, Container } from "@/components/ui";
import { getKategori } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AddProdukPage() {
  // Kategori diambil di server, lalu dioper ke form (client component).
  const kategori = await getKategori();

  return (
    <main className="py-8">
      <Container>
        <div className="mx-auto max-w-2xl">
          <BackButton href="/admin/dashboard">Kembali ke daftar produk</BackButton>
          <h1 className="mb-6 mt-4 text-2xl font-bold text-ink">Tambah produk</h1>
          <ProdukForm kategori={kategori} />
        </div>
      </Container>
    </main>
  );
}