-- Migration: Interview Podcast Video System
-- Version: 002
-- Description: Adds tables to support interview podcast videos

-- Interview Podcasts Table
CREATE TABLE IF NOT EXISTS interview_podcasts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    host VARCHAR(100) NOT NULL,
    guest VARCHAR(100),
    video_url VARCHAR(255) NOT NULL,
    thumbnail_url VARCHAR(255),
    duration INTEGER, -- in seconds
    category VARCHAR(50),
    tags TEXT[],
    view_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_interview_podcasts_user_id ON interview_podcasts(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_podcasts_host ON interview_podcasts(host);
CREATE INDEX IF NOT EXISTS idx_interview_podcasts_category ON interview_podcasts(category);
CREATE INDEX IF NOT EXISTS idx_interview_podcasts_is_published ON interview_podcasts(is_published);
