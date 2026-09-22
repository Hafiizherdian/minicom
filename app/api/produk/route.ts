// File: app/api/produk/route.ts
import { randomUUID } from "node:crypto";
import { getSession } from "@/lib/auth";
import { createProduk, getProdukTersedia } from "@/lib/db";
import { deleteImage, saveImage } from "@/lib/upload";
import { parseProdukForm, pgCode, slugify } from "@/lib/validasi";

export const runtime = "nodejs";

const bad = (error: string) => Response.json({ error }, { status: 400 });

export async function GET() {
  const produk = await getProdukTersedia();
  return Response.json(produk);
}

export async function POST(request: Request) {
  // Proxy hanya menjaga halaman /admin, jadi API tetap harus cek sesi sendiri.
  if (!(await getSession())) {
    return Response.json({ error: "Tidak diizinkan" }, { status: 401 });
  }

  const parsed = parseProdukForm(await request.formData(), true);
  if ("error" in parsed) return bad(parsed.error);
  const { data, file } = parsed;
  if (!file) return bad("Gambar wajib diunggah");

  // 1) tulis file ke disk  2) INSERT ke database. Jika INSERT gagal, hapus file-nya.
  const gambar_url = await saveImage(file);
  const baseSlug = slugify(data.nama);

  try {
    let produk;
    try {
      produk = await createProduk({ ...data, slug: baseSlug, gambar_url });
    } catch (err) {
      // 23505 = slug sudah dipakai -> coba lagi dengan akhiran acak
      if (pgCode(err) !== "23505") throw err;
      produk = await createProduk({
        ...data,
        slug: `${baseSlug}-${randomUUID().slice(0, 6)}`,
        gambar_url,
      });
    }
    return Response.json(produk, { status: 201 });
  } catch (err) {
    await deleteImage(gambar_url);
    if (pgCode(err) === "23503") return bad("Kategori tidak ditemukan");
    console.error("POST /api/produk gagal:", err);
    return Response.json({ error: "Gagal menyimpan produk" }, { status: 500 });
  }
}