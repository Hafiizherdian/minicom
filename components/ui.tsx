import Link from "next/link";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export function rupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

// ---------- Button ----------

type Variant = "primary" | "dark" | "outline" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-white hover:opacity-90",
  dark: "bg-ink text-white hover:opacity-90",
  outline: "border border-line text-ink hover:bg-line/50",
  danger: "border border-brand text-brand hover:bg-brand hover:text-white",
};

// Dipakai untuk <a>/<Link> yang tampilannya seperti tombol.
export function buttonClass(variant: Variant = "primary", extra = "") {
  return [
    "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold",
    "transition disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    extra,
  ].join(" ");
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={buttonClass(variant, className)} {...props} />;
}

// ---------- Form ----------

const fieldClass =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink " +
  "placeholder:text-muted/60 focus:border-brand";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={fieldClass} {...props} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={fieldClass} {...props} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={fieldClass} {...props} />;
}

// ---------- Layout ----------

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`w-full px-4 sm:px-6 ${className}`}>
      {children}
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight text-ink">
          kape<span className="text-brand">dodolan</span>
        </Link>
        <nav aria-label="Navigasi utama" className="flex items-center gap-4">
          <Link
            href="/"
            className="hidden text-sm font-medium text-muted hover:text-ink sm:block"
          >
            Beranda
          </Link>
          <Link href="/produk" className={buttonClass("primary", "px-4 py-2")}>
            Semua Produk
          </Link>
        </nav>
      </Container>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line py-8">
      <Container className="flex flex-col items-center gap-1 text-center text-sm text-muted">
        <p>
          <span className="font-semibold text-ink">kape</span>
          <span className="font-semibold text-brand">dodolan</span> &middot; belanja
          mudah, langsung lewat Shopee.
        </p>
        <p>&copy; {new Date().getFullYear()} Semua hak dilindungi.</p>
      </Container>
    </footer>
  );
}

export function Banner({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { label: string; href: string };
}) {
  const external = action ? /^https?:\/\//.test(action.href) : false;
  const cta = "mt-6 px-6 py-3 text-base";

  return (
    <section className="relative overflow-hidden rounded-2xl bg-ink px-6 py-10 sm:px-12 sm:py-14">
      {/* Hiasan lingkaran, disembunyikan di layar kecil supaya teks tetap terbaca */}
      <div
        aria-hidden
        className="absolute -right-16 -top-16 hidden size-64 rounded-full bg-brand sm:block"
      />
      <div
        aria-hidden
        className="absolute -bottom-24 right-28 hidden size-48 rounded-full bg-muted/60 sm:block"
      />

      <div className="relative max-w-xl">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-2xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 text-base leading-relaxed text-line sm:text-lg">
            {description}
          </p>
        )}
        {action &&
          (external ? (
            <a
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass("primary", cta)}
            >
              {action.label}
            </a>
          ) : (
            <Link href={action.href} className={buttonClass("primary", cta)}>
              {action.label}
            </Link>
          ))}
      </div>
    </section>
  );
}

export function BackButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={buttonClass("dark", "gap-2")}>
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 5l-5 5 5 5" />
      </svg>
      {children}
    </Link>
  );
}