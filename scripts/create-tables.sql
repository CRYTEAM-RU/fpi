-- Create mods table
CREATE TABLE IF NOT EXISTS mods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  author VARCHAR(100) NOT NULL,
  version VARCHAR(20) DEFAULT '1.0',
  category VARCHAR(50) NOT NULL,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table for better organization
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, description) VALUES
  ('vehicles', 'Автомобили и транспортные средства'),
  ('maps', 'Карты и локации'),
  ('parts', 'Запчасти и компоненты'),
  ('skins', 'Скины и ливреи'),
  ('sounds', 'Звуковые моды'),
  ('other', 'Прочие моды')
ON CONFLICT (name) DO NOTHING;

-- Create RLS policies
ALTER TABLE mods ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on mods" ON mods FOR SELECT USING (true);
CREATE POLICY "Allow public read access on categories" ON categories FOR SELECT USING (true);

-- Allow authenticated users to insert/update/delete mods (for admin)
CREATE POLICY "Allow authenticated insert on mods" ON mods FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update on mods" ON mods FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete on mods" ON mods FOR DELETE USING (auth.role() = 'authenticated');
