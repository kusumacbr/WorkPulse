import { apiSuccess } from "@/server/api-helpers";

export async function GET() {
  const skills = [
    { name: "TypeScript & React 19", category: "FRONTEND", endorsedCount: 14 },
    { name: "Node.js & Next.js App Router", category: "BACKEND", endorsedCount: 18 },
    { name: "PostgreSQL & Prisma ORM", category: "DATABASE", endorsedCount: 12 },
    { name: "Biometric Hardware Protocols & HMAC", category: "SECURITY", endorsedCount: 8 },
    { name: "Enterprise RBAC & Auth Architectures", category: "ARCHITECTURE", endorsedCount: 11 },
  ];

  return apiSuccess({ skills, total: skills.length });
}
