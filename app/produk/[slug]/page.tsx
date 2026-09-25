// File: app/produk/[slug]/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BackButton,
  buttonClass,
  Container,
  rupiah,
  SiteFooter,
  SiteHeader,
} from "@/components/ui";
import { getProdukBySlug } from "@/lib/db";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const produk = await getProdukBySlug(slug);
  if (!produk) return { title: "Produk tidak ditemukan" };

  return {
    title: produk.nama,
    description: produk.deskripsi?.slice(0, 160) ?? undefined,
    openGraph: { images: [produk.gambar_url] },
  };
}

export default async function ProdukPage({ params }: Props) {
  const { slug } = await params;
  const produk = await getProdukBySlug(slug);
  if (!produk) notFound();

  return (
    <>
      <SiteHeader />
      <main className="flex-1 py-8">
        <Container>
          <BackButton href="/produk">Kembali ke semua produk</BackButton>

          <div className="mt-6 grid gap-8 md:grid-cols-2">
            <div className="relative aspect-square overflow-hidden rounded-xl border border-line bg-line">
              <Image
                src={produk.gambar_url}
                alt={produk.nama}
                fill
                unoptimized
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>

            <div>
              {produk.kategori_nama && (
                <Link
                  href={`/produk?kategori=${produk.kategori_slug}`}
                  className="text-sm text-muted hover:text-ink"
                >
                  {produk.kategori_nama}
                </Link>
              )}
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">
                {produk.nama}
              </h1>
              <p className="mt-3 text-2xl font-bold text-brand">
                {rupiah(produk.harga)}
              </p>

              {produk.deskripsi && (
                <p className="mt-6 max-w-prose whitespace-pre-line leading-relaxed text-muted">
                  {produk.deskripsi}
                </p>
              )}

              {produk.shopee_url && (
                <a
                  href={produk.shopee_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClass("primary", "mt-8 px-6 py-3 text-base")}
                >
                  Beli di Shopee
                </a>
              )}
            </div>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}