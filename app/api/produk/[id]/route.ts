// File: app/api/produk/[id]/route.ts
import { getSession } from "@/lib/auth";
import {
  deleteProduk,
  getProdukById,
  setProdukTersedia,
  updateProduk,
} from "@/lib/db";
import { deleteImage, saveImage } from "@/lib/upload";
import { parseId, parseProdukForm, pgCode } from "@/lib/validasi";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

const unauthorized = () =>
  Response.json({ error: "Tidak diizinkan" }, { status: 401 });
const bad = (error: string) => Response.json({ error }, { status: 400 });
const notFound = () =>
  Response.json({ error: "Produk tidak ditemukan" }, { status: 404 });

// Tampilkan / sembunyikan produk (JSON).
export async function PATCH(request: Request, ctx: Ctx) {
  if (!(await getSession())) return unauthorized();

  const id = parseId((await ctx.params).id);
  const body = await request.json().catch(() => null);
  if (id === null || typeof body?.is_available !== "boolean") {
    return bad("Permintaan tidak valid");
  }

  const ok = await setProdukTersedia(id, body.is_available);
  return ok ? Response.json({ ok: true }) : notFound();
}

// Edit produk (FormData, gambar opsional). Slug tidak diubah supaya link lama tetap jalan.
export async function PUT(request: Request, ctx: Ctx) {
  if (!(await getSession())) return unauthorized();

  const id = parseId((await ctx.params).id);
  if (id === null) return bad("ID tidak valid");

  const parsed = parseProdukForm(await request.formData(), false);
  if ("error" in parsed) return bad(parsed.error);
  const { data, file } = parsed;

  const lama = await getProdukById(id);
  if (!lama) return notFound();

  const gambarBaru = file ? await saveImage(file) : null;

  try {
    await updateProduk(id, {
      ...data,
      gambar_url: gambarBaru ?? lama.gambar_url,
    });
  } catch (err) {
    if (gambarBaru) await deleteImage(gambarBaru);
    if (pgCode(err) === "23503") return bad("Kategori tidak ditemukan");
    console.error("PUT /api/produk/[id] gagal:", err);
    return Response.json({ error: "Gagal menyimpan perubahan" }, { status: 500 });
  }

  // Gambar lama baru dihapus setelah UPDATE berhasil.
  if (gambarBaru) await deleteImage(lama.gambar_url);
  return Response.json({ ok: true });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  if (!(await getSession())) return unauthorized();

  const id = parseId((await ctx.params).id);
  if (id === null) return bad("ID tidak valid");

  const gambarUrl = await deleteProduk(id);
  if (!gambarUrl) return notFound();

  await deleteImage(gambarUrl);
  return Response.json({ ok: true });
}