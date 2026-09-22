import Image from "next/image";
import Link from "next/link";
import type { Produk } from "@/types";
import { buttonClass, rupiah } from "./ui";

export default function ProdukCard({ produk }: { produk: Produk }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-line bg-white">
      <Link
        href={`/produk/${produk.slug}`}
        className="relative block aspect-square bg-line"
      >
        <Image
          src={produk.gambar_url}
          alt={produk.nama}
          fill
          unoptimized
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-4">
        {produk.kategori_nama && (
          <span className="text-xs text-muted">{produk.kategori_nama}</span>
        )}
        <Link href={`/produk/${produk.slug}`}>
          <h3 className="line-clamp-2 font-semibold text-ink">{produk.nama}</h3>
        </Link>
        <p className="text-lg font-bold text-brand">{rupiah(produk.harga)}</p>

        {produk.shopee_url && (
          <a
            href={produk.shopee_url}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass("primary", "mt-3")}
          >
            Beli di Shopee
          </a>
        )}
      </div>
    </article>
  );
}