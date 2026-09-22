// File: app/api/kategori/route.ts
import { getSession } from "@/lib/auth";
import { createKategori, getKategori } from "@/lib/db";
import { pgCode, slugify } from "@/lib/validasi";

export const runtime = "nodejs";

export async function GET() {
  return Response.json(await getKategori());
}

export async function POST(request: Request) {
  if (!(await getSession())) {
    return Response.json({ error: "Tidak diizinkan" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const nama = typeof body?.nama === "string" ? body.nama.trim() : "";
  if (!nama || nama.length > 100) {
    return Response.json(
      { error: "Nama kategori wajib diisi (maks. 100 karakter)" },
      { status: 400 },
    );
  }

  try {
    const kategori = await createKategori(nama, slugify(nama, 100));
    return Response.json(kategori, { status: 201 });
  } catch (err) {
    // 23505 = slug sudah dipakai, artinya nama yang sama sudah ada
    if (pgCode(err) === "23505") {
      return Response.json(
        { error: "Kategori dengan nama itu sudah ada" },
        { status: 409 },
      );
    }
    console.error("POST /api/kategori gagal:", err);
    return Response.json({ error: "Gagal menyimpan kategori" }, { status: 500 });
  }
}