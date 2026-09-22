// File: app/admin/dashboard/layout.tsx
import type { ReactNode } from "react";
import AdminSidebar from "@/components/adminsidebar";
import { getSession } from "@/lib/auth";

// Layout ini membungkus semua halaman di /admin/dashboard/* (produk, tambah, edit, kategori).
// Halaman login ada di /admin/login, jadi tidak ikut memakai sidebar.
export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="md:flex md:min-h-screen">
      <AdminSidebar nama={session?.nama ?? "Admin"} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}