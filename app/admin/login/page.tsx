// File: app/admin/login/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, Field, Input } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: form.get("nama"),
          password: form.get("password"),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Gagal masuk");
        return;
      }
      router.replace("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 rounded-xl border border-line p-6"
      >
        <h1 className="text-2xl font-bold text-ink">
          Masuk ke admin
        </h1>

        <Field label="Nama">
          <Input name="nama" autoComplete="username" required />
        </Field>
        <Field label="Password">
          <Input
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </Field>

        {error && (
          <p role="alert" className="text-sm font-medium text-brand">
            {error}
          </p>
        )}

        <Button type="submit" variant="dark" disabled={loading} className="w-full">
          {loading ? "Memproses..." : "Masuk"}
        </Button>
      </form>
    </main>
  );
}