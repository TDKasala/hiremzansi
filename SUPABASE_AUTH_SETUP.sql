-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user' NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Insert admin user if it doesn't exist
INSERT INTO users (username, email, password, role, is_active, email_verified)
VALUES ('admin', 'deniskasala17@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', true, true)
ON CONFLICT (email) DO NOTHING;

-- Create basic tables needed for the application
CREATE TABLE IF NOT EXISTS cvs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  content TEXT NOT NULL,
  file_path TEXT,
  title TEXT DEFAULT 'My CV',
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Add RLS policies for security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cvs ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Create policies for cvs table
CREATE POLICY "Users can view own CVs" ON cvs
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own CVs" ON cvs
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own CVs" ON cvs
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own CVs" ON cvs
  FOR DELETE USING (auth.uid()::text = user_id::text);