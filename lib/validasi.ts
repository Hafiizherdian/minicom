// File: lib/validasi.ts
import { validateImage } from "@/lib/upload";

const MAKS_INT = 2_147_483_647; // batas INTEGER Postgres

export function slugify(text: string, maks = 140) {
  return (
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, maks) || "item"
  );
}

// Kode error Postgres, mis. "23505" (unique_violation), "23503" (foreign_key_violation)
export function pgCode(err: unknown) {
  return (err as { code?: string })?.code;
}

// Hanya http/https, supaya tidak ada `javascript:` masuk ke atribut href.
export function isHttpUrl(value: string) {
  try {
    const { protocol } = new URL(value);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}

export function parseId(raw: string) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 && id <= MAKS_INT ? id : null;
}

export type ProdukInput = {
  kategori_id: number | null;
  nama: string;
  deskripsi: string | null;
  harga: number;
  shopee_url: string | null;
  is_available: boolean;
};

// Dipakai bersama oleh POST (tambah) dan PUT (edit).
export function parseProdukForm(
  form: FormData,
  gambarWajib: boolean,
): { error: string } | { data: ProdukInput; file: File | null } {
  const nama = String(form.get("nama") ?? "").trim();
  const deskripsi = String(form.get("deskripsi") ?? "").trim() || null;
  const harga = Number(form.get("harga"));
  const kategoriRaw = String(form.get("kategori_id") ?? "");
  const kategori_id = kategoriRaw ? Number(kategoriRaw) : null;
  const shopee_url = String(form.get("shopee_url") ?? "").trim() || null;
  const is_available = form.get("is_available") === "on";

  if (!nama || nama.length > 150) return { error: "Nama wajib diisi (maks. 150 karakter)" };
  if (!Number.isInteger(harga) || harga < 0) return { error: "Harga harus bilangan bulat, minimal 0" };
  if (harga > MAKS_INT) return { error: "Harga terlalu besar" };
  if (kategori_id !== null && parseId(kategoriRaw) === null) return { error: "Kategori tidak valid" };
  if (shopee_url && (shopee_url.length > 255 || !isHttpUrl(shopee_url))) {
    return { error: "Link Shopee harus berupa URL http/https yang valid" };
  }

  const raw = form.get("gambar");
  const file = raw instanceof File && raw.size > 0 ? raw : null;
  if (!file && gambarWajib) return { error: "Gambar wajib diunggah" };
  if (file) {
    const imageError = validateImage(file);
    if (imageError) return { error: imageError };
  }

  return {
    data: { kategori_id, nama, deskripsi, harga, shopee_url, is_available },
    file,
  };
}

export type BannerInput = { judul: string | null; link_url: string | null };

// Dipakai oleh POST /api/banner. Gambar selalu wajib (banner tanpa gambar tidak berguna).
export function parseBannerForm(
  form: FormData,
): { error: string } | { data: BannerInput; file: File } {
  const judul = String(form.get("judul") ?? "").trim() || null;
  const linkRaw = String(form.get("link_url") ?? "").trim();
  const link_url = linkRaw || null;

  if (judul && judul.length > 150) return { error: "Judul maksimal 150 karakter" };
  if (link_url) {
    const internal = link_url.startsWith("/");
    if (link_url.length > 255 || (!internal && !isHttpUrl(link_url))) {
      return { error: "Link harus berupa URL http/https yang valid, atau path internal seperti /produk" };
    }
  }

  const raw = form.get("gambar");
  if (!(raw instanceof File) || raw.size === 0) return { error: "Gambar wajib diunggah" };
  const imageError = validateImage(raw);
  if (imageError) return { error: imageError };

  return { data: { judul, link_url }, file: raw };
}