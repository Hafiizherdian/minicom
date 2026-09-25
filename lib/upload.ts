// File: lib/upload.ts
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

// Disimpan di ./uploads (di luar public/) lalu disajikan lewat
// app/uploads/[filename]/route.ts. File yang ditulis ke public/ setelah build
// tidak dijamin ikut disajikan oleh `next start`.
export const UPLOAD_DIR = path.join(process.cwd(), "uploads");
export const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB
export const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20 MB

export const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const VIDEO_TYPES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
};

const MEDIA_TYPES: Record<string, string> = { ...IMAGE_TYPES, ...VIDEO_TYPES };

export const MIME_BY_EXT: Record<string, string> = Object.fromEntries(
  Object.entries(MEDIA_TYPES).map(([mime, ext]) => [ext, mime]),
);

export function jenisMedia(file: File): "image" | "video" | null {
  if (IMAGE_TYPES[file.type]) return "image";
  if (VIDEO_TYPES[file.type]) return "video";
  return null;
}

// Dipakai untuk gambar cover produk & banner (harus gambar, tidak boleh video).
export function validateImage(file: File): string | null {
  if (!IMAGE_TYPES[file.type]) return "Gambar harus berformat JPG, PNG, atau WebP";
  if (file.size > MAX_IMAGE_SIZE) return "Ukuran gambar maksimal 2 MB";
  return null;
}

// Dipakai untuk galeri tambahan produk (boleh gambar atau video).
export function validateMedia(file: File): string | null {
  const jenis = jenisMedia(file);
  if (!jenis) return "Format harus JPG, PNG, WebP, MP4, atau WebM";
  if (jenis === "image" && file.size > MAX_IMAGE_SIZE) {
    return "Ukuran gambar maksimal 2 MB";
  }
  if (jenis === "video" && file.size > MAX_VIDEO_SIZE) {
    return "Ukuran video maksimal 20 MB";
  }
  return null;
}

async function simpanFile(file: File) {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${randomUUID()}.${MEDIA_TYPES[file.type]}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

// Nama file dibuat server (UUID + ekstensi dari MIME), nama asli dari user diabaikan.
export async function saveImage(file: File) {
  return simpanFile(file);
}

export async function saveMedia(file: File) {
  const url = await simpanFile(file);
  return { url, tipe: jenisMedia(file)! };
}

export async function deleteImage(url: string) {
  try {
    await unlink(path.join(UPLOAD_DIR, path.basename(url)));
  } catch {
    // file sudah tidak ada, abaikan
  }
}