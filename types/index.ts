// File: types/index.ts
export interface Admin {
  id: number;
  nama: string;
  password_hash: string;
}

export interface Kategori {
  id: number;
  nama: string;
  slug: string;
}

export interface Produk {
  id: number;
  kategori_id: number | null;
  nama: string;
  slug: string;
  deskripsi: string | null;
  harga: number;
  gambar_url: string;
  galeri?: ProdukGambar[];
  shopee_url: string | null;
  is_available: boolean;
  created_at: Date;
  // hasil JOIN dengan tabel kategori
  kategori_nama: string | null;
  kategori_slug: string | null;
}

export interface NewProduk {
  kategori_id: number | null;
  nama: string;
  slug: string;
  deskripsi: string | null;
  harga: number;
  gambar_url: string;
  shopee_url: string | null;
  is_available: boolean;
}

export interface SessionPayload {
  adminId: number;
  nama: string;
}

export interface Banner {
  id: number;
  gambar_url: string;
  judul: string | null;
  link_url: string | null;
  urutan: number;
}

export type TipeMedia = "image" | "video";

export interface ProdukGambar {
  id: number;
  gambar_url: string;
  tipe: TipeMedia;
  urutan: number;
}