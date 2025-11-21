/*
  # Create Media Albums Table

  1. New Tables
    - `media_albums`
      - `id` (uuid, primary key) - Unique identifier for each album
      - `title` (text) - Album title/event name
      - `description` (text) - Album description
      - `folder_id` (text) - Google Drive folder ID
      - `category` (text) - Album category (Campus Missions, Street Evangelism, etc.)
      - `event_date` (date) - Date of the event
      - `cover_image` (text) - URL to cover image
      - `is_active` (boolean) - Whether album is visible on site
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
  
  2. Security
    - Enable RLS on `media_albums` table
    - Add policy for public to read active albums
    - Add policy for authenticated users to manage albums
*/

CREATE TABLE IF NOT EXISTS media_albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  folder_id text NOT NULL,
  category text NOT NULL,
  event_date date DEFAULT CURRENT_DATE,
  cover_image text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE media_albums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active albums"
  ON media_albums
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert albums"
  ON media_albums
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update albums"
  ON media_albums
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete albums"
  ON media_albums
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_media_albums_category ON media_albums(category);
CREATE INDEX IF NOT EXISTS idx_media_albums_is_active ON media_albums(is_active);
CREATE INDEX IF NOT EXISTS idx_media_albums_event_date ON media_albums(event_date DESC);
