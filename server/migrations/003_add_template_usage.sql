-- Add the template_usage table to track user template generation
CREATE TABLE IF NOT EXISTS template_usage (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    template_type TEXT NOT NULL,
    watermark_id TEXT NOT NULL,
    security_code TEXT NOT NULL,
    metadata JSONB,
    ip_address TEXT,
    device_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_template_usage_user_id ON template_usage(user_id);

-- Add index on watermark_id for security verification
CREATE INDEX IF NOT EXISTS idx_template_usage_watermark_id ON template_usage(watermark_id);

-- Add index on created_at for usage statistics
CREATE INDEX IF NOT EXISTS idx_template_usage_created_at ON template_usage(created_at);

-- Add template generation tracking columns to subscriptions table
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS daily_template_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_template_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_daily_reset TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_monthly_reset TIMESTAMP WITH TIME ZONE;

-- Add function to automatically reset usage counters
CREATE OR REPLACE FUNCTION reset_template_usage_counters()
RETURNS void AS $$
BEGIN
    -- Reset daily counters for users who haven't reset today
    UPDATE subscriptions
    SET daily_template_count = 0,
        last_daily_reset = NOW()
    WHERE last_daily_reset < CURRENT_DATE OR last_daily_reset IS NULL;
    
    -- Reset monthly counters for users whose last reset was in a previous month
    UPDATE subscriptions
    SET monthly_template_count = 0,
        last_monthly_reset = NOW()
    WHERE EXTRACT(MONTH FROM last_monthly_reset) <> EXTRACT(MONTH FROM NOW())
       OR EXTRACT(YEAR FROM last_monthly_reset) <> EXTRACT(YEAR FROM NOW())
       OR last_monthly_reset IS NULL;
END;
$$ LANGUAGE plpgsql;