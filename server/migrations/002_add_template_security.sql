-- Add template security features to prevent premium users from monetizing template service

-- Add template_usage tracking to subscriptions table
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS templates_used INTEGER DEFAULT 0;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS last_template_reset TIMESTAMP;

-- Create generated_templates table for tracking and security
CREATE TABLE IF NOT EXISTS generated_templates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL, 
  content TEXT NOT NULL,
  watermark_id TEXT NOT NULL,
  generated_for TEXT NOT NULL,
  device_info TEXT,
  ip_address TEXT,
  meta_data JSONB,
  is_revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gen_templates_user_id ON generated_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_gen_templates_watermark_id ON generated_templates(watermark_id);
CREATE INDEX IF NOT EXISTS idx_gen_templates_created_at ON generated_templates(created_at);