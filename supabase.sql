-- Schema definition for EduShop AI on Supabase PostgreSQL
-- Copy and run this in your Supabase SQL Editor

-- 1. Create Products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade INTEGER NOT NULL,
  type TEXT NOT NULL,
  price INTEGER DEFAULT 0,
  original_price INTEGER DEFAULT 0,
  rating REAL DEFAULT 5.0,
  sales INTEGER DEFAULT 0,
  tag TEXT,
  is_free BOOLEAN DEFAULT FALSE,
  image TEXT,
  description TEXT,
  file_data TEXT,
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Initiatives table
CREATE TABLE IF NOT EXISTS initiatives (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  "desc" TEXT, -- desc is a SQL keyword, quoting avoids syntax conflicts
  price INTEGER DEFAULT 0,
  sales INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT,
  total_amount INTEGER DEFAULT 0,
  items JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Feedbacks table
CREATE TABLE IF NOT EXISTS feedbacks (
  id TEXT PRIMARY KEY,
  name TEXT DEFAULT 'Ẩn danh',
  email TEXT DEFAULT 'Ẩn danh',
  msg TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Games table
CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL DEFAULT 'Bậc THCS',
  title TEXT NOT NULL,
  tag TEXT,
  "desc" TEXT,
  image TEXT,
  file_data TEXT,
  file_name TEXT,
  is_paid BOOLEAN DEFAULT false,
  price NUMERIC DEFAULT 0,
  sale_price NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  name TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create Admin Accounts table
CREATE TABLE IF NOT EXISTS admin_accounts (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Optional Row Level Security (RLS) configurations
-- Feel free to adjust these policies according to your production requirements.
-- For simple setup, you can disable RLS or allow public read/write as specified below:

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_accounts ENABLE ROW LEVEL SECURITY;

-- Select and write policies (Allow all operations for server-side endpoints, as API routes secure admin access)
CREATE POLICY "Allow public read access to products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public read access to initiatives" ON initiatives FOR SELECT USING (true);
CREATE POLICY "Allow public read access to games" ON games FOR SELECT USING (true);
CREATE POLICY "Allow public read access to subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "Allow public read access to admin_accounts" ON admin_accounts FOR SELECT USING (true);

CREATE POLICY "Allow public full access to products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to initiatives" ON initiatives FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to feedbacks" ON feedbacks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to games" ON games FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to subjects" ON subjects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to admin_accounts" ON admin_accounts FOR ALL USING (true) WITH CHECK (true);

-- API/Service-role full controls (Required for server-side management)
CREATE POLICY "Allow full access for service_role to games" ON games FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for service_role" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for service_role" ON initiatives FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for service_role" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for service_role" ON feedbacks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for service_role to subjects" ON subjects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for service_role to admin_accounts" ON admin_accounts FOR ALL USING (true) WITH CHECK (true);
