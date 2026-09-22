// Sumber warna brand untuk kode JS/TS (mis. style inline, chart, email).
// Untuk Tailwind, nilai yang sama didefinisikan di app/globals.css (@theme).
export const theme = {
  colors: {
    ink: "#1f1f1f", // teks utama, tombol gelap
    brand: "#97c2ec", // aksen utama: harga, tombol aksi
    line: "#dedede", // border, background tipis
    muted: "#d6d0c2", // teks sekunder
  },
} as const;

export type ThemeColor = keyof typeof theme.colors;