import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cqjnsznacqnzudpkgjjj.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxam5zem5hY3FuenVkcGtnampqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU3MzE0OCwiZXhwIjoyMTAzMTQ5MTQ4fQ.EwzD8hQ4U4y4aF-qJkI-oVbJ2P4nB_Gj8-X1uXj6oWE";

const supabase = createClient(supabaseUrl, serviceKey);

async function main() {
  const { data, error } = await supabase.from("employees").select("*").limit(5);
  console.log("Sample employees:", data);
  if (error) console.error("Error:", error);
}

main();
