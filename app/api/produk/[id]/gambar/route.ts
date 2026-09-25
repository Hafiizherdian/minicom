// File: app/api/produk/[id]/gambar/route.ts
import { getSession } from "@/lib/auth";
import { tambahMediaProduk } from "@/lib/db";
import { saveMedia, validateMedia } from "@/lib/upload";
import { parseId, pgCode } from "@/lib/validasi";

export const runtime = "nodejs";

const unauthorized = () => Response.json({ error: "Tidak diizinkan" }, { status: 401 });
const bad = (error: string) => Response.json({ error }, { status: 400 });
const MAKS_MEDIA = 8;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getSession())) return unauthorized();

  const id = parseId((await params).id);
  if (id === null) return bad("ID produk tidak valid");

  const form = await request.formData();
  const files = form
    .getAll("media")
    .filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length === 0) return bad("Pilih minimal satu gambar atau video");
  if (files.length > MAKS_MEDIA) return bad(`Maksimal ${MAKS_MEDIA} berkas sekaligus`);
  for (const file of files) {
    const err = validateMedia(file);
    if (err) return bad(err);
  }

  try {
    const hasil = [];
    for (const file of files) {
      const { url, tipe } = await saveMedia(file);
      hasil.push(await tambahMediaProduk(id, url, tipe));
    }
    return Response.json(hasil, { status: 201 });
  } catch (err) {
    if (pgCode(err) === "23503") return bad("Produk tidak ditemukan");
    console.error("POST /api/produk/[id]/gambar gagal:", err);
    return Response.json({ error: "Gagal menyimpan berkas" }, { status: 500 });
  }
}