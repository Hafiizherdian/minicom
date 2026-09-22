// File: app/api/auth/route.ts
import {
  clearSessionCookie,
  createSessionToken,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import { getAdminByNama } from "@/lib/db";

export const runtime = "nodejs";

// Hash palsu supaya waktu respons tetap mirip saat nama admin tidak ditemukan.
const DUMMY_HASH =
  "$2b$12$C6UzMDM.H6dfI/f/IKcEeO5n7E4oJ7Z2b1xw0m0v7Wn8JpJc7g5vK";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const nama = typeof body?.nama === "string" ? body.nama.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!nama || !password) {
    return Response.json(
      { error: "Nama dan password wajib diisi" },
      { status: 400 },
    );
  }

  const admin = await getAdminByNama(nama);
  const valid = await verifyPassword(
    password,
    admin?.password_hash ?? DUMMY_HASH,
  );

  if (!admin || !valid) {
    return Response.json({ error: "Nama atau password salah" }, { status: 401 });
  }

  const token = await createSessionToken({ adminId: admin.id, nama: admin.nama });
  await setSessionCookie(token);
  return Response.json({ ok: true });
}

export async function DELETE() {
  await clearSessionCookie();
  return Response.json({ ok: true });
}