// File: app/page.tsx
import Link from "next/link";
import BannerSlider from "@/components/bannerslider";
import ProdukCard from "@/components/produkcard";
import { Banner, buttonClass, Container, SiteFooter, SiteHeader } from "@/components/ui";
import { getBanner, getKategoriDenganJumlah, getProdukTersedia } from "@/lib/db";

// Data produk berubah dari admin, dan build tidak boleh membutuhkan koneksi DB.
export const dynamic = "force-dynamic";

const JUMLAH_TERBARU = 8;
const JUMLAH_KATEGORI = 6;

export default async function LandingPage() {
  const [produkTerbaru, semuaKategori, banner] = await Promise.all([
    getProdukTersedia({ urut: "terbaru", limit: JUMLAH_TERBARU }),
    getKategoriDenganJumlah(),
    getBanner(),
  ]);

  // Hanya kategori yang punya produk yang ditampilkan sebagai pintasan.
  const kategoriUnggulan = semuaKategori
    .filter((k) => k.jumlah > 0)
    .slice(0, JUMLAH_KATEGORI);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Container className="py-8 sm:py-12">
          {banner.length > 0 ? (
            <BannerSlider items={banner} />
          ) : (
            <Banner
              title="Selamat Datang di (jeneng e toko)"
              description="Temukan produk terbaik dengan harga terbaik hanya di sini. Pesan langsung, bayar aman lewat Shopee."
              action={{ label: "Jelajahi Produk", href: "/produk" }}
            />
          )}
        </Container>

        {kategoriUnggulan.length > 0 && (
          <Container className="py-6">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-2xl font-bold tracking-tight text-ink">
                Kategori pilihan
              </h2>
              <Link
                href="/produk"
                className="shrink-0 text-sm font-medium text-muted hover:text-ink"
              >
                Lihat semua
              </Link>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {kategoriUnggulan.map((k) => (
                <Link
                  key={k.id}
                  href={`/produk?kategori=${k.slug}`}
                  className="rounded-xl border border-line p-4 text-center transition hover:border-ink hover:bg-line/20"
                >
                  <p className="font-semibold text-ink">{k.nama}</p>
                  <p className="mt-1 text-xs text-muted">{k.jumlah} produk</p>
                </Link>
              ))}
            </div>
          </Container>
        )}

        <Container className="py-8">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-tight text-ink">
              Produk terbaru
            </h2>
            <Link
              href="/produk"
              className="shrink-0 text-sm font-medium text-muted hover:text-ink"
            >
              Lihat semua
            </Link>
          </div>

          {produkTerbaru.length === 0 ? (
            <p className="mt-10 text-center text-muted">Belum ada produk.</p>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {produkTerbaru.map((p) => (
                <ProdukCard key={p.id} produk={p} />
              ))}
            </div>
          )}
        </Container>

        <Container className="pb-14">
          <div className="rounded-2xl bg-line/40 px-6 py-10 text-center sm:px-12">
            <h2 className="text-2xl font-bold text-ink">Siap belanja?</h2>
            <p className="mx-auto mt-2 max-w-md text-muted">
              Semua produk bisa langsung dipesan dan dibayar lewat Shopee, aman dan
              terpercaya.
            </p>
            <Link href="/produk" className={buttonClass("dark", "mt-6 px-6 py-3 text-base")}>
              Mulai belanja
            </Link>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}