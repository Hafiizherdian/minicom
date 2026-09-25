// File: app/api/banner/route.ts
import { getSession } from "@/lib/auth";
import { createBanner, getBanner } from "@/lib/db";
import { deleteImage, saveImage } from "@/lib/upload";
import { parseBannerForm } from "@/lib/validasi";

export const runtime = "nodejs";

const bad = (error: string) => Response.json({ error }, { status: 400 });

export async function GET() {
  return Response.json(await getBanner());
}

export async function POST(request: Request) {
  // Proxy hanya menjaga halaman /admin, jadi API tetap harus cek sesi sendiri.
  if (!(await getSession())) {
    return Response.json({ error: "Tidak diizinkan" }, { status: 401 });
  }

  const parsed = parseBannerForm(await request.formData());
  if ("error" in parsed) return bad(parsed.error);
  const { data, file } = parsed;

  // 1) tulis file ke disk  2) INSERT ke database. Jika INSERT gagal, hapus file-nya.
  const gambar_url = await saveImage(file);
  try {
    const banner = await createBanner({ ...data, gambar_url });
    return Response.json(banner, { status: 201 });
  } catch (err) {
    await deleteImage(gambar_url);
    console.error("POST /api/banner gagal:", err);
    return Response.json({ error: "Gagal menyimpan banner" }, { status: 500 });
  }
}