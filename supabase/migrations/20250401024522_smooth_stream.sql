/*
  # Links Platform Schema

  1. New Tables
    - platforms
      - Platform types (WhatsApp, Telegram, Facebook)
    - categories
      - Content categories (Anime, Movies, etc.)
    - links
      - User submitted links with metadata
  
  2. Security
    - Enable RLS on all tables
    - Allow public read access
    - Allow authenticated users to create links
*/

-- Create enum types
CREATE TYPE platform_type AS ENUM ('whatsapp', 'telegram', 'facebook');

-- Create platforms table
CREATE TABLE IF NOT EXISTS platforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name platform_type NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create links table
CREATE TABLE IF NOT EXISTS links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  url text NOT NULL,
  platform_id uuid REFERENCES platforms(id) NOT NULL,
  category_id uuid REFERENCES categories(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access on platforms" ON platforms
  FOR SELECT TO public USING (true);

CREATE POLICY "Allow public read access on categories" ON categories
  FOR SELECT TO public USING (true);

CREATE POLICY "Allow public read access on links" ON links
  FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated users to create links" ON links
  FOR INSERT TO authenticated USING (true);

-- Insert initial data
INSERT INTO platforms (name) VALUES
  ('whatsapp'),
  ('telegram'),
  ('facebook');

INSERT INTO categories (name) VALUES
  ('Anime'),
  ('Películas'),
  ('Series'),
  ('Música'),
  ('Deportes'),
  ('Videojuegos'),
  ('Tecnología'),
  ('Educación'),
  ('Adultos'),
  ('Otros');