import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

// Disimpan di ./uploads (di luar public/) lalu disajikan lewat
// app/uploads/[filename]/route.ts. File yang ditulis ke public/ setelah build
// tidak dijamin ikut disajikan oleh `next start`.
export const UPLOAD_DIR = path.join(process.cwd(), "uploads");
export const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB

export const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const MIME_BY_EXT: Record<string, string> = Object.fromEntries(
  Object.entries(IMAGE_TYPES).map(([mime, ext]) => [ext, mime]),
);

export function validateImage(file: File): string | null {
  if (!IMAGE_TYPES[file.type]) return "Gambar harus berformat JPG, PNG, atau WebP";
  if (file.size > MAX_IMAGE_SIZE) return "Ukuran gambar maksimal 2 MB";
  return null;
}

// Nama file dibuat server (UUID + ekstensi dari MIME), nama asli dari user diabaikan.
export async function saveImage(file: File) {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${randomUUID()}.${IMAGE_TYPES[file.type]}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

export async function deleteImage(url: string) {
  try {
    await unlink(path.join(UPLOAD_DIR, path.basename(url)));
  } catch {
    // file sudah tidak ada, abaikan
  }
}