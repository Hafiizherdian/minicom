// File: components/adminsidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const BASE = "/admin/dashboard";

const ICON = {
  produk: "M21 8l-9-5-9 5v8l9 5 9-5V8zM3.3 7.7L12 12.5l8.7-4.8M12 12.5V22",
  tambah: "M12 8v8M8 12h8M12 21a9 9 0 100-18 9 9 0 000 18z",
  kategori: "M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0L3 13V3h10l7.6 7.6a2 2 0 010 2.8zM7.5 7.5h.01",
  banner: "M4 5h16v14H4V5zM7 16l3-4 2.5 3L15 11l4 5H7zM8.5 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z",
  toko: "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5",
  keluar: "M15 4h3a1 1 0 011 1v14a1 1 0 01-1 1h-3M10 16l-4-4 4-4M6 12h11",
  menu: "M4 6h16M4 12h16M4 18h16",
  tutup: "M6 6l12 12M18 6L6 18",
};

// "aktif" menentukan menu mana yang menyala. Halaman edit dianggap bagian dari "Produk".
const MENU = [
  {
    href: BASE,
    label: "Produk",
    icon: ICON.produk,
    aktif: (p: string) => p === BASE || p.startsWith(`${BASE}/edit`),
  },
  {
    href: `${BASE}/add`,
    label: "Tambah produk",
    icon: ICON.tambah,
    aktif: (p: string) => p.startsWith(`${BASE}/add`),
  },
  {
    href: `${BASE}/kategori`,
    label: "Kategori",
    icon: ICON.kategori,
    aktif: (p: string) => p.startsWith(`${BASE}/kategori`),
  },
  {
    href: `${BASE}/banner`,
    label: "Banner",
    icon: ICON.banner,
    aktif: (p: string) => p.startsWith(`${BASE}/banner`),
  },
];

function Icon({ d }: { d: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

const itemClass = (aktif: boolean) =>
  `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
    aktif
      ? "bg-ink text-white"
      : "text-muted hover:bg-line/50 hover:text-ink"
  }`;

export default function AdminSidebar({ nama }: { nama: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.replace("/admin/login");
    router.refresh();
  }

  // Dipakai di sidebar desktop dan panel mobile (fungsi biasa, bukan komponen).
  const renderMenu = (onNavigate?: () => void) => (
    <>
      <nav aria-label="Menu admin" className="space-y-1">
        {MENU.map((m) => {
          const aktif = m.aktif(pathname);
          return (
            <Link
              key={m.href}
              href={m.href}
              onClick={onNavigate}
              aria-current={aktif ? "page" : undefined}
              className={itemClass(aktif)}
            >
              <Icon d={m.icon} />
              {m.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-1 border-t border-line pt-4">
        <Link href="/" onClick={onNavigate} className={itemClass(false)}>
          <Icon d={ICON.toko} />
          Lihat toko
        </Link>
        <button type="button" onClick={logout} className={itemClass(false)}>
          <Icon d={ICON.keluar} />
          Keluar
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile: top bar dengan menu buka-tutup */}
      <div className="sticky top-0 z-20 border-b border-line bg-white md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="min-w-0">
            <p className="font-bold leading-tight text-ink">Panel Admin</p>
            <p className="truncate text-xs text-muted">{nama}</p>
          </div>
          <button
            type="button"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg border border-line p-2 text-ink hover:bg-line/50"
          >
            <Icon d={open ? ICON.tutup : ICON.menu} />
          </button>
        </div>
        {open && (
          <div className="flex flex-col gap-4 border-t border-line p-3">
            {renderMenu(() => setOpen(false))}
          </div>
        )}
      </div>

      {/* Tablet & desktop: sidebar tetap di kiri */}
      <aside className="hidden md:block md:w-60 md:shrink-0 md:border-r md:border-line">
        <div className="flex flex-col p-4 md:sticky md:top-0 md:h-screen">
          <div className="px-3 pb-5 pt-2">
            <p className="text-lg font-bold text-ink">Panel Admin</p>
            <p className="truncate text-xs text-muted">{nama}</p>
          </div>
          {renderMenu()}
        </div>
      </aside>
    </>
  );
}