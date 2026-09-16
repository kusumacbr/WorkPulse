import { createAdminClient } from '../src/lib/supabase/admin';

async function checkTasks() {
  const supabase = createAdminClient();
  if (!supabase) {
    console.log('No supabase client');
    return;
  }
  const { data, error } = await supabase.from('daily_tasks').select('*');
  console.log('Error:', error);
  console.log('Tasks:', JSON.stringify(data, null, 2));
}

checkTasks().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
