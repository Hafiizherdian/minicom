// File: app/uploads/[filename]/route.ts
import { readFile } from "node:fs/promises";
import path from "node:path";
import { MIME_BY_EXT, UPLOAD_DIR } from "@/lib/upload";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ filename: string }> };

const notFound = () => new Response("Not found", { status: 404 });

export async function GET(
  _request: Request,
  ctx: Ctx,
) {
  const { filename } = await ctx.params;

  // basename mencegah path traversal (../../etc/passwd)
  const safeName = path.basename(filename);
  const contentType = MIME_BY_EXT[path.extname(safeName).slice(1)];
  if (!contentType) return notFound();

  try {
    const data = await readFile(path.join(UPLOAD_DIR, safeName));
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": contentType,
        // nama file berupa UUID, isinya tidak pernah berubah
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return notFound();
  }
}