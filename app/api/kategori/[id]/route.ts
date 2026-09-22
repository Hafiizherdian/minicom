// File: app/api/kategori/[id]/route.ts
import { getSession } from "@/lib/auth";
import { deleteKategori, updateKategoriNama } from "@/lib/db";
import { parseId } from "@/lib/validasi";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

const unauthorized = () =>
  Response.json({ error: "Tidak diizinkan" }, { status: 401 });
const notFound = () =>
  Response.json({ error: "Kategori tidak ditemukan" }, { status: 404 });

// Ganti nama. Slug sengaja tidak berubah supaya link filter lama tetap jalan.
export async function PATCH(request: Request, ctx: Ctx) {
  if (!(await getSession())) return unauthorized();

  const id = parseId((await ctx.params).id);
  const body = await request.json().catch(() => null);
  const nama = typeof body?.nama === "string" ? body.nama.trim() : "";
  if (id === null || !nama || nama.length > 100) {
    return Response.json({ error: "Nama kategori tidak valid" }, { status: 400 });
  }

  return (await updateKategoriNama(id, nama))
    ? Response.json({ ok: true })
    : notFound();
}

// Produk di kategori ini tidak ikut terhapus: kategori_id-nya jadi NULL (ON DELETE SET NULL).
export async function DELETE(_request: Request, ctx: Ctx) {
  if (!(await getSession())) return unauthorized();

  const id = parseId((await ctx.params).id);
  if (id === null) {
    return Response.json({ error: "ID tidak valid" }, { status: 400 });
  }

  return (await deleteKategori(id)) ? Response.json({ ok: true }) : notFound();
}