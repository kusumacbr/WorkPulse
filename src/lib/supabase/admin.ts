import { createClient } from "@supabase/supabase-js";

const FALLBACK_SUPABASE_URL = "https://cqjnsznacqnzudpkgjjj.supabase.co";
const FALLBACK_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxam5zem5hY3FuenVkcGtnampqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU3MzE0OCwiZXhwIjoyMTAzMTQ5MTQ4fQ.Gz5pjB9dhy7tMhxxx-mUOEi8-DXQyvrSKul-FU6UPhU";

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || FALLBACK_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
