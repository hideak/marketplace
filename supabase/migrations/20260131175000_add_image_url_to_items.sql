-- Add image_url column to items table
alter table items add column image_url text;

-- Note: You will need to create a public storage bucket named 'item-images'
-- and set up the following policies in the Supabase Dashboard -> Storage:
-- 1. Allow public read access to 'item-images'
-- 2. Allow authenticated/anon uploads to 'item-images'
