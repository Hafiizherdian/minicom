// File: app/admin/dashboard/kategori/page.tsx
import KategoriManager from "@/components/katagorimanager";
import { BackButton, Container } from "@/components/ui";
import { getKategoriDenganJumlah } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function KategoriPage() {
  const items = await getKategoriDenganJumlah();

  return (
    <main className="py-8">
      <Container>
        <div className="mx-auto max-w-2xl">
          <BackButton href="/admin/dashboard">Kembali ke daftar produk</BackButton>
          <h1 className="mb-6 mt-4 text-2xl font-bold text-ink">Kelola kategori</h1>
          <KategoriManager items={items} />
        </div>
      </Container>
    </main>
  );
}