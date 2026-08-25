import { createBrowserClient } from "@supabase/ssr";

const FALLBACK_SUPABASE_URL = "https://cqjnsznacqnzudpkgjjj.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxam5zem5hY3FuenVkcGtnampqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NzMxNDgsImV4cCI6MjEwMzE0OTE0OH0.I2utLcT7d-2gRL1v6xk4ON3MsyG83jRey14BG-5m-FE";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY
  );
}
