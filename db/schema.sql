-- Tabel 1: Admin
CREATE TABLE admin (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

-- Tabel 2: Kategori
CREATE TABLE kategori (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
);

-- Tabel 3: Produk
CREATE TABLE produk (
    id SERIAL PRIMARY KEY,
    kategori_id INT REFERENCES kategori(id) ON DELETE SET NULL,  -- sebelumnya: categories(id)
    nama VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    deskripsi TEXT,
    harga INTEGER NOT NULL,
    gambar_url VARCHAR(255) NOT NULL,
    shopee_url VARCHAR(255),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel 4: Banner
CREATE TABLE IF NOT EXISTS banner (
    id SERIAL PRIMARY KEY,
    gambar_url VARCHAR(255) NOT NULL,
    judul VARCHAR(150),
    link_url VARCHAR(255),
    urutan INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_banner_urutan ON banner (urutan, id);

-- Mempercepat query beranda: WHERE is_available = true ORDER BY created_at DESC
CREATE INDEX idx_produk_available_created ON produk (is_available, created_at DESC);

-- Contoh kategori awal (ganti sesuai kebutuhan)
INSERT INTO kategori (nama, slug) VALUES
    ('Umum', 'umum'),
    ('Aksesoris', 'aksesoris');