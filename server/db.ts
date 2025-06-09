import { createClient } from '@supabase/supabase-js';
import * as schema from "@shared/schema";

// Supabase configuration with fallback
const supabaseUrl = process.env.SUPABASE_URL || 'https://vkfqohfaxapfajwrzebz.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrZnFvaGZheGFwZmFqd3J6ZWJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMjAyODgsImV4cCI6MjA2NDg5NjI4OH0.-qVAAZSOYmkN6IPQOxgagMjd5ywfQqsosp9udH2lpTA';

// Create Supabase client for database operations
export const supabase = createClient(supabaseUrl, supabaseKey);

// Simplified database interface for Supabase
export const db = {
  select: () => ({ from: (table: any) => supabase.from(table.name || table) }),
  insert: (table: any) => ({ values: (data: any) => supabase.from(table.name || table).insert(data) }),
  update: (table: any) => ({ set: (data: any) => ({ where: (condition: any) => supabase.from(table.name || table).update(data) }) }),
  delete: (table: any) => ({ where: (condition: any) => supabase.from(table.name || table).delete() })
};

export const closeDbConnection = async () => {
  // Supabase handles connections automatically
};