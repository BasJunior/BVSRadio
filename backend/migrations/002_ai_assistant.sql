-- Migration: Add AI Assistant Conversation Tables
-- Description: Creates tables for storing AI assistant conversation history

-- Conversations table for storing chat messages
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);

-- Add comment for documentation
COMMENT ON TABLE conversations IS 'Stores AI assistant conversation history for personalized responses';
COMMENT ON COLUMN conversations.role IS 'Message sender: user (human), assistant (AI), or system (context)';
