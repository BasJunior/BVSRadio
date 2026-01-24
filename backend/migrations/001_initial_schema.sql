-- Migration: Initial Schema Setup
-- Version: 001
-- Description: Creates all initial tables for BVSRadio platform

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Run the main schema
\i ../models/schema.sql

-- Insert sample data for testing
INSERT INTO users (username, email, password_hash, full_name, bio) VALUES
('admin', 'admin@bvsradio.com', '$2b$10$examplehash', 'Admin User', 'BVSRadio Administrator'),
('dj_music', 'dj@bvsradio.com', '$2b$10$examplehash', 'DJ Music', 'Music enthusiast and DJ');

INSERT INTO radio_stations (name, description, stream_url, genre, country) VALUES
('BVS Classic Hits', 'Playing the best classic hits 24/7', 'http://stream.bvsradio.com/classic', 'Classic Rock', 'USA'),
('BVS Electronic', 'Electronic and EDM music station', 'http://stream.bvsradio.com/electronic', 'Electronic', 'UK');

INSERT INTO products (name, description, price, category, stock_quantity) VALUES
('BVS Radio Premium Subscription', 'Ad-free listening with unlimited skips', 9.99, 'Subscription', 999),
('BVS Radio T-Shirt', 'Official BVSRadio merchandise', 24.99, 'Merchandise', 100);
