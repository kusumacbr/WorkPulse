import { apiSuccess } from "@/server/api-helpers";

export async function GET() {
  const days = [
    {
      date: "2026-08-22",
      workMode: "OFFICE",
      shift: "10:00 AM - 07:00 PM",
      firstIn: "10:08 AM",
      lastOut: "07:14 PM",
      totalSpanHours: 9.1,
      workedMinutes: 546,
      status: "PRESENT",
      complianceStatus: "ON_TIME",
      anomalies: [],
    },
    {
      date: "2026-08-21",
      workMode: "OFFICE",
      shift: "10:00 AM - 07:00 PM",
      firstIn: "10:04 AM",
      lastOut: "07:02 PM",
      totalSpanHours: 8.96,
      workedMinutes: 538,
      status: "PRESENT",
      complianceStatus: "ON_TIME",
      anomalies: [],
    },
  ];

  return apiSuccess({ attendanceDays: days, total: days.length });
}
