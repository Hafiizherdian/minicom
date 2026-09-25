import { cache } from "react";
import { Pool, type QueryResultRow } from "pg";
import type { Admin, Banner, Kategori, NewProduk, Produk } from "@/types";

// Satu pool untuk seluruh proses. Di dev, hot reload membuat modul ini
// dievaluasi ulang, jadi pool disimpan di globalThis agar koneksi tidak menumpuk.
const globalForPg = globalThis as unknown as { pgPool?: Pool };

export const pool =
  globalForPg.pgPool ??
  new Pool({ connectionString: process.env.DATABASE_URL, max: 10 });

if (process.env.NODE_ENV !== "production") globalForPg.pgPool = pool;

async function query<T extends QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL belum diset. Buat .env.local lalu restart npm run dev.");
  }
  const res = await pool.query<T>(text, params);
  return res.rows;
}

const PRODUK_SELECT = `
  SELECT p.id, p.kategori_id, p.nama, p.slug, p.deskripsi, p.harga,
         p.gambar_url, p.shopee_url, p.is_available, p.created_at,
         k.nama AS kategori_nama, k.slug AS kategori_slug
  FROM produk p
  LEFT JOIN kategori k ON k.id = p.kategori_id
`;

// ---------- Publik ----------

export type FilterProduk = {
  kategori?: string;
  min?: number;
  max?: number;
  urut?: "terbaru" | "termurah" | "termahal";
  limit?: number; // dipakai landing page untuk daftar "produk terbaru"
};

// Nama kolom di ORDER BY tidak bisa jadi parameter ($1), jadi dipilih dari daftar tetap ini.
const URUTAN = {
  terbaru: "p.created_at DESC",
  termurah: "p.harga ASC, p.created_at DESC",
  termahal: "p.harga DESC, p.created_at DESC",
} as const;

export async function getProdukTersedia(filter: FilterProduk = {}) {
  const where = ["p.is_available = true"];
  const params: unknown[] = [];

  if (filter.kategori) {
    params.push(filter.kategori);
    where.push(`k.slug = $${params.length}`);
  }
  if (filter.min !== undefined) {
    params.push(filter.min);
    where.push(`p.harga >= $${params.length}`);
  }
  if (filter.max !== undefined) {
    params.push(filter.max);
    where.push(`p.harga <= $${params.length}`);
  }

  let sql = `${PRODUK_SELECT}
     WHERE ${where.join(" AND ")}
     ORDER BY ${URUTAN[filter.urut ?? "terbaru"]}`;

  if (filter.limit !== undefined) {
    params.push(filter.limit);
    sql += ` LIMIT $${params.length}`;
  }

  return query<Produk>(sql, params);
}

// cache() dari React: generateMetadata dan page memanggil fungsi ini,
// tapi query hanya jalan sekali per request.
export const getProdukBySlug = cache(async (slug: string) => {
  const rows = await query<Produk>(
    `${PRODUK_SELECT} WHERE p.slug = $1 AND p.is_available = true`,
    [slug],
  );
  return rows[0] ?? null;
});

export async function getKategori() {
  return query<Kategori>(`SELECT id, nama, slug FROM kategori ORDER BY nama`);
}

// ---------- Admin ----------

export async function getAdminByNama(nama: string) {
  const rows = await query<Admin>(
    `SELECT id, nama, password_hash FROM admin WHERE nama = $1`,
    [nama],
  );
  return rows[0] ?? null;
}

export async function getSemuaProduk() {
  return query<Produk>(`${PRODUK_SELECT} ORDER BY p.created_at DESC`);
}

export async function createProduk(p: NewProduk) {
  const rows = await query<{ id: number; slug: string }>(
    `INSERT INTO produk
       (kategori_id, nama, slug, deskripsi, harga, gambar_url, shopee_url, is_available)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, slug`,
    [
      p.kategori_id,
      p.nama,
      p.slug,
      p.deskripsi,
      p.harga,
      p.gambar_url,
      p.shopee_url,
      p.is_available,
    ],
  );
  return rows[0];
}

export async function setProdukTersedia(id: number, isAvailable: boolean) {
  const rows = await query<{ id: number }>(
    `UPDATE produk SET is_available = $2 WHERE id = $1 RETURNING id`,
    [id, isAvailable],
  );
  return rows.length > 0;
}

// Mengembalikan gambar_url supaya file-nya bisa ikut dihapus.
export async function deleteProduk(id: number) {
  const rows = await query<{ gambar_url: string }>(
    `DELETE FROM produk WHERE id = $1 RETURNING gambar_url`,
    [id],
  );
  return rows[0]?.gambar_url ?? null;
}

// ---------- Kategori (Admin CRUD) ----------
// getKategoriDenganJumlah juga dipakai landing page untuk "Kategori pilihan".

export type KategoriJumlah = Kategori & { jumlah: number };

export async function getProdukById(id: number) {
  const rows = await query<Produk>(`${PRODUK_SELECT} WHERE p.id = $1`, [id]);
  return rows[0] ?? null;
}

// slug tidak ikut diubah supaya link produk lama tetap jalan
export async function updateProduk(id: number, p: Omit<NewProduk, "slug">) {
  const rows = await query<{ id: number }>(
    `UPDATE produk
     SET kategori_id = $2, nama = $3, deskripsi = $4, harga = $5,
         gambar_url = $6, shopee_url = $7, is_available = $8
     WHERE id = $1
     RETURNING id`,
    [id, p.kategori_id, p.nama, p.deskripsi, p.harga, p.gambar_url, p.shopee_url, p.is_available],
  );
  return rows.length > 0;
}

export async function getKategoriDenganJumlah() {
  return query<KategoriJumlah>(
    `SELECT k.id, k.nama, k.slug, COUNT(p.id)::int AS jumlah
     FROM kategori k
     LEFT JOIN produk p ON p.kategori_id = k.id
     GROUP BY k.id
     ORDER BY k.nama`,
  );
}

export async function createKategori(nama: string, slug: string) {
  const rows = await query<Kategori>(
    `INSERT INTO kategori (nama, slug) VALUES ($1, $2) RETURNING id, nama, slug`,
    [nama, slug],
  );
  return rows[0];
}

export async function updateKategoriNama(id: number, nama: string) {
  const rows = await query<{ id: number }>(
    `UPDATE kategori SET nama = $2 WHERE id = $1 RETURNING id`,
    [id, nama],
  );
  return rows.length > 0;
}

export async function deleteKategori(id: number) {
  const rows = await query<{ id: number }>(
    `DELETE FROM kategori WHERE id = $1 RETURNING id`,
    [id],
  );
  return rows.length > 0;
}

// ---------- Banner (slider di landing page) ----------

export async function getBanner() {
  return query<Banner>(
    `SELECT id, gambar_url, judul, link_url, urutan FROM banner ORDER BY urutan ASC, id ASC`,
  );
}

export async function createBanner(data: {
  gambar_url: string;
  judul: string | null;
  link_url: string | null;
}) {
  const urutanRows = await query<{ berikutnya: number }>(
    `SELECT COALESCE(MAX(urutan), -1) + 1 AS berikutnya FROM banner`,
  );
  const urutan = urutanRows[0].berikutnya;

  const rows = await query<Banner>(
    `INSERT INTO banner (gambar_url, judul, link_url, urutan)
     VALUES ($1, $2, $3, $4)
     RETURNING id, gambar_url, judul, link_url, urutan`,
    [data.gambar_url, data.judul, data.link_url, urutan],
  );
  return rows[0];
}

// Mengembalikan gambar_url supaya file-nya bisa ikut dihapus.
export async function deleteBanner(id: number) {
  const rows = await query<{ gambar_url: string }>(
    `DELETE FROM banner WHERE id = $1 RETURNING gambar_url`,
    [id],
  );
  return rows[0]?.gambar_url ?? null;
}

// Menukar "urutan" dengan tetangganya (naik = ke atas, turun = ke bawah).
// Pakai transaksi supaya dua UPDATE ini tidak diselingi permintaan lain.
export async function pindahBanner(id: number, arah: "naik" | "turun") {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL belum diset. Buat .env.local lalu restart npm run dev.");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query<{ id: number; urutan: number }>(
      `SELECT id, urutan FROM banner ORDER BY urutan ASC, id ASC FOR UPDATE`,
    );

    const idx = rows.findIndex((r) => r.id === id);
    const target = arah === "naik" ? idx - 1 : idx + 1;
    if (idx === -1 || target < 0 || target >= rows.length) {
      await client.query("ROLLBACK");
      return false;
    }

    const a = rows[idx];
    const b = rows[target];
    await client.query(`UPDATE banner SET urutan = $2 WHERE id = $1`, [a.id, b.urutan]);
    await client.query(`UPDATE banner SET urutan = $2 WHERE id = $1`, [b.id, a.urutan]);
    await client.query("COMMIT");
    return true;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}