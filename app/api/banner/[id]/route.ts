// File: app/api/banner/[id]/route.ts
import { getSession } from "@/lib/auth";
import { deleteBanner, pindahBanner } from "@/lib/db";
import { deleteImage } from "@/lib/upload";
import { parseId } from "@/lib/validasi";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

const unauthorized = () =>
  Response.json({ error: "Tidak diizinkan" }, { status: 401 });
const bad = (error: string) => Response.json({ error }, { status: 400 });

// Pindah urutan (naik = ke atas, turun = ke bawah). Kalau sudah di ujung, tidak
// terjadi apa-apa (ok: false), bukan error.
export async function PATCH(request: Request, ctx: Ctx) {
  if (!(await getSession())) return unauthorized();

  const id = parseId((await ctx.params).id);
  const body = await request.json().catch(() => null);
  const arah = body?.arah;
  if (id === null || (arah !== "naik" && arah !== "turun")) {
    return bad("Permintaan tidak valid");
  }

  const ok = await pindahBanner(id, arah);
  return Response.json({ ok });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  if (!(await getSession())) return unauthorized();

  const id = parseId((await ctx.params).id);
  if (id === null) return bad("ID tidak valid");

  const gambarUrl = await deleteBanner(id);
  if (!gambarUrl) {
    return Response.json({ error: "Banner tidak ditemukan" }, { status: 404 });
  }

  await deleteImage(gambarUrl);
  return Response.json({ ok: true });
}