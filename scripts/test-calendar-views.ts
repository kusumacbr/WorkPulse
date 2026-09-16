function formatLocalDateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const generateMonthCalendar = (monthOffset: number) => {
  const today = new Date();
  const targetDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const monthName = targetDate.toLocaleDateString("en-US", { month: "long" });

  const monthEnd = new Date(year, month + 1, 0);
  const totalDays = monthEnd.getDate();

  const todayStr = formatLocalDateKey(today);

  const days: any[] = [];

  for (let d = 1; d <= totalDays; d++) {
    const currDate = new Date(year, month, d);
    const dateKey = formatLocalDateKey(currDate);
    const dayOfWeek = currDate.getDay();
    const isToday = dateKey === todayStr;
    const isPast = dateKey < todayStr;
    const isFuture = dateKey > todayStr;
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    days.push({
      dateKey,
      dayNum: d,
      monthName,
      isToday,
      isPast,
      isFuture,
      isWeekend,
      status: isToday ? "Today · Live" : isWeekend ? "Weekend Off" : isPast ? "Completed" : "Scheduled",
    });
  }

  return { monthName, year, totalDays, days };
};

console.log("=== Testing 30-Day Month ===");
const month0 = generateMonthCalendar(0);
console.log(`Month: ${month0.monthName} ${month0.year}, Total days: ${month0.totalDays}`);
const day15_m0 = month0.days.find((d) => d.dayNum === 15);
const day16_m0 = month0.days.find((d) => d.dayNum === 16);
const day17_m0 = month0.days.find((d) => d.dayNum === 17);
console.log("Day 15 (Sept):", day15_m0);
console.log("Day 16 (Sept):", day16_m0);
console.log("Day 17 (Sept):", day17_m0);

console.log("\n=== Testing 60-Day View (Month 2: October) ===");
const month1 = generateMonthCalendar(1);
console.log(`Month 2: ${month1.monthName} ${month1.year}, Total days: ${month1.totalDays}`);
const day1_m1 = month1.days.find((d) => d.dayNum === 1);
const day15_m1 = month1.days.find((d) => d.dayNum === 15);
console.log("Oct Day 1:", day1_m1);
console.log("Oct Day 15:", day15_m1);

const allMonth2Future = month1.days.every((d) => d.isFuture && !d.isPast && !d.isToday);
console.log("All October days are future:", allMonth2Future);
