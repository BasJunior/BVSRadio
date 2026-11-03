-- Seed data for Wolf Beat Packs and Mixtape products
-- Run this script to populate the database with sample products

-- Insert Wolf Beat Pack products
INSERT INTO products (name, description, price, category, image_url, stock_quantity, is_available)
VALUES 
    ('Wolf Beat Pack Vol. 1', 'Professional beat pack featuring 10 high-quality instrumentals perfect for hip-hop and rap artists.', 9.95, 'Wolf Beat Pack', 'https://via.placeholder.com/400x400/7c3aed/ffffff?text=Wolf+Beat+Vol+1', 50, true),
    ('Wolf Beat Pack Vol. 2', 'Premium collection of 15 exclusive beats with diverse styles ranging from trap to boom-bap.', 14.95, 'Wolf Beat Pack', 'https://via.placeholder.com/400x400/7c3aed/ffffff?text=Wolf+Beat+Vol+2', 35, true),
    ('Wolf Beat Pack Vol. 3 - Deluxe', 'Deluxe edition with 20 beats, stems, and commercial licenses included.', 24.95, 'Wolf Beat Pack', 'https://via.placeholder.com/400x400/7c3aed/ffffff?text=Wolf+Beat+Vol+3', 20, true),
    ('Wolf Beat Pack - Trap Edition', 'Specialized trap beat collection with heavy 808s and modern production.', 12.95, 'Wolf Beat Pack', 'https://via.placeholder.com/400x400/7c3aed/ffffff?text=Trap+Edition', 40, true),
    ('Wolf Beat Pack - Lo-Fi Collection', 'Chill lo-fi beats perfect for study, relaxation, or creative work.', 11.95, 'Wolf Beat Pack', 'https://via.placeholder.com/400x400/7c3aed/ffffff?text=Lo-Fi+Collection', 45, true);

-- Insert Mixtape products
INSERT INTO products (name, description, price, category, image_url, stock_quantity, is_available)
VALUES
    ('Summer Vibes Mixtape 2024', 'Curated selection of the hottest summer tracks featuring local and international artists.', 7.95, 'Mixtape', 'https://via.placeholder.com/400x400/4f46e5/ffffff?text=Summer+Vibes', 100, true),
    ('Late Night Sessions Mixtape', 'Smooth R&B and soul tracks perfect for late-night listening sessions.', 8.95, 'Mixtape', 'https://via.placeholder.com/400x400/4f46e5/ffffff?text=Late+Night', 75, true),
    ('Hip-Hop Classics Mixtape', 'A nostalgic journey through the best hip-hop tracks from the 90s and 2000s.', 9.95, 'Mixtape', 'https://via.placeholder.com/400x400/4f46e5/ffffff?text=Hip-Hop+Classics', 60, true),
    ('Afrobeat Fusion Mixtape', 'Contemporary Afrobeat sounds blending traditional rhythms with modern production.', 10.95, 'Mixtape', 'https://via.placeholder.com/400x400/4f46e5/ffffff?text=Afrobeat+Fusion', 55, true),
    ('Workout Energy Mixtape', 'High-energy tracks to power through your workout sessions.', 7.95, 'Mixtape', 'https://via.placeholder.com/400x400/4f46e5/ffffff?text=Workout+Energy', 80, true),
    ('Chill Vibes Mixtape', 'Relaxing beats and melodies for unwinding after a long day.', 8.95, 'Mixtape', 'https://via.placeholder.com/400x400/4f46e5/ffffff?text=Chill+Vibes', 70, true);

-- Verify the data was inserted
SELECT COUNT(*) as wolf_beat_count FROM products WHERE category = 'Wolf Beat Pack';
SELECT COUNT(*) as mixtape_count FROM products WHERE category = 'Mixtape';
