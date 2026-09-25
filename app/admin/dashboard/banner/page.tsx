// File: app/admin/dashboard/banner/page.tsx
import BannerManager from "@/components/bannermanager";
import { BackButton, Container } from "@/components/ui";
import { getBanner } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function BannerPage() {
  const items = await getBanner();

  return (
    <main className="py-8">
      <Container>
        <div>
          <BackButton href="/admin/dashboard">Kembali ke daftar produk</BackButton>
          <h1 className="mb-1 mt-4 text-2xl font-bold text-ink">Kelola banner</h1>
          <p className="mb-6 text-sm text-muted">
            Banner tampil bergantian di landing page. Urutan paling atas tampil
            duluan.
          </p>
          <BannerManager items={items} />
        </div>
      </Container>
    </main>
  );
}