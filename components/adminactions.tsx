// File: components/adminactions.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, buttonClass } from "./ui";

export function ProdukActions({
  id,
  isAvailable,
}: {
  id: number;
  isAvailable: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function run(init: RequestInit) {
    setBusy(true);
    try {
      const res = await fetch(`/api/produk/${id}`, init);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error ?? "Gagal memproses permintaan");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={`/admin/dashboard/edit/${id}`} className={buttonClass("dark")}>
        Edit
      </Link>
      <Button
        variant="outline"
        disabled={busy}
        onClick={() =>
          run({
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_available: !isAvailable }),
          })
        }
      >
        {isAvailable ? "Sembunyikan" : "Tampilkan"}
      </Button>
      <Button
        variant="danger"
        disabled={busy}
        onClick={() => {
          if (confirm("Hapus produk ini? Gambar juga akan dihapus.")) {
            run({ method: "DELETE" });
          }
        }}
      >
        Hapus
      </Button>
    </div>
  );
}

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <Button variant="outline" onClick={logout}>
      Keluar
    </Button>
  );
}