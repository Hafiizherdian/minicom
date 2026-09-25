// File: app/api/produk/[id]/gambar/[gambarId]/route.ts
import { getSession } from "@/lib/auth";
import { hapusMediaProduk } from "@/lib/db";
import { deleteImage } from "@/lib/upload";
import { parseId } from "@/lib/validasi";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ gambarId: string }> },
) {
  if (!(await getSession())) {
    return Response.json({ error: "Tidak diizinkan" }, { status: 401 });
  }

  const gambarId = parseId((await params).gambarId);
  if (gambarId === null) {
    return Response.json({ error: "ID tidak valid" }, { status: 400 });
  }

  const url = await hapusMediaProduk(gambarId);
  if (!url) return Response.json({ error: "Berkas tidak ditemukan" }, { status: 404 });

  await deleteImage(url);
  return Response.json({ ok: true });
}