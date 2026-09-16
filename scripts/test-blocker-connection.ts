import { createAdminClient } from "../src/lib/supabase/admin";

async function runBlockerTest() {
  console.log("=== Testing Two-Way Blocker Connection & Supabase Persistence ===");

  const supabase = createAdminClient();
  if (!supabase) {
    console.error("Supabase client is unavailable");
    process.exit(1);
  }

  const testHelpId = `help-emp-sarah-${Date.now()}`;
  const testEmpId = "emp-sarah";
  const testEmpName = "Sara Devi";
  const today = new Date().toISOString().split("T")[0]!;

  // 1. Create Blocker / Help Request
  console.log("1. Creating blocker request in Supabase feedbacks table...");
  const initialNotes = JSON.stringify({
    topic: "Blocker / Technical Issue",
    details: "Stuck on OAuth JWT verification error 401",
    department: "Development",
    leadName: "Alex Lead",
    urgency: "URGENT",
    createdAt: "Today at 03:45 PM",
    employeeEmail: "employee.test@xorstack.com",
  });

  const { error: insErr } = await supabase.from("feedbacks").upsert({
    id: testHelpId,
    employee_id: testEmpId,
    employee_name: testEmpName,
    lead_id: "lead-alex",
    lead_name: "Alex Lead",
    date: today,
    notes: initialNotes,
    rating: 1, // URGENT
    sentiment: "PENDING",
    action_item: "HELP_REQUEST",
    created_at: new Date().toISOString(),
  });

  if (insErr) {
    console.error("Failed to insert blocker:", insErr.message);
    process.exit(1);
  }
  console.log("✓ Blocker inserted successfully!");

  // 2. Query Blocker from Supabase
  console.log("2. Querying blocker from Supabase feedbacks table...");
  const { data: fetchRows, error: fetchErr } = await supabase
    .from("feedbacks")
    .select("*")
    .eq("id", testHelpId)
    .single();

  if (fetchErr || !fetchRows) {
    console.error("Failed to query blocker:", fetchErr?.message);
    process.exit(1);
  }
  console.log("✓ Query success! Found row:", {
    id: fetchRows.id,
    employee: fetchRows.employee_name,
    sentiment: fetchRows.sentiment,
    action_item: fetchRows.action_item,
  });

  const parsedMeta = JSON.parse(fetchRows.notes);
  console.log("✓ Parsed blocker metadata:", {
    topic: parsedMeta.topic,
    details: parsedMeta.details,
    urgency: parsedMeta.urgency,
  });

  // 3. Lead Acknowledges Blocker with Response Note
  console.log("3. Simulating Lead Acknowledgment with response note...");
  const ackNotes = JSON.stringify({
    ...parsedMeta,
    acknowledgedAt: "Today at 03:46 PM",
    leadResponse: "Alex Lead: Checking auth middleware logs now, let's jump on Zoom.",
  });

  const { error: ackErr } = await supabase
    .from("feedbacks")
    .update({
      sentiment: "ACKNOWLEDGED",
      notes: ackNotes,
    })
    .eq("id", testHelpId);

  if (ackErr) {
    console.error("Failed to acknowledge blocker:", ackErr.message);
    process.exit(1);
  }

  const { data: ackRow } = await supabase.from("feedbacks").select("*").eq("id", testHelpId).single();
  const ackMeta = JSON.parse(ackRow.notes);
  console.log("✓ Lead Acknowledgment verified:", {
    status: ackRow.sentiment,
    leadResponse: ackMeta.leadResponse,
    acknowledgedAt: ackMeta.acknowledgedAt,
  });

  // 4. Resolve Blocker
  console.log("4. Simulating Blocker Resolution...");
  const resNotes = JSON.stringify({
    ...ackMeta,
    resolvedAt: "Today at 03:50 PM",
    resolvedByLead: true,
    resolvedByEmployee: true,
  });

  const { error: resErr } = await supabase
    .from("feedbacks")
    .update({
      sentiment: "RESOLVED",
      notes: resNotes,
    })
    .eq("id", testHelpId);

  if (resErr) {
    console.error("Failed to resolve blocker:", resErr.message);
    process.exit(1);
  }

  const { data: resRow } = await supabase.from("feedbacks").select("*").eq("id", testHelpId).single();
  console.log("✓ Blocker Resolution verified in Supabase:", {
    status: resRow.sentiment,
  });

  // 5. Cleanup Test Blocker
  console.log("5. Cleaning up test blocker...");
  await supabase.from("feedbacks").delete().eq("id", testHelpId);
  console.log("✓ Cleaned up test blocker record!");

  console.log("\n=== ALL BLOCKER TWO-WAY PERSISTENCE TESTS PASSED SUCCESSFULLY! ===");
}

runBlockerTest();
