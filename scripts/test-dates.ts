function formatLocalDate(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const today = new Date();
const todayStr = formatLocalDate(today);
console.log("Today is:", todayStr, "Date string:", today.toDateString());

// Test 30-Day Month
const year = today.getFullYear();
const month = today.getMonth();
const totalDays = new Date(year, month + 1, 0).getDate();
console.log("Month:", today.toLocaleDateString("en-US", { month: "long" }), "Total days:", totalDays);

for (const d of [15, 16, 17]) {
  const dateObj = new Date(year, month, d);
  const dateKey = formatLocalDate(dateObj);
  console.log(`Day ${d}: dateKey=${dateKey}, isToday=${dateKey === todayStr}, isPast=${dateKey < todayStr}, isFuture=${dateKey > todayStr}`);
}
