import { apiSuccess } from "@/server/api-helpers";
import { BadgeService } from "@/server/services/coaching-service";

export async function GET() {
  const definitions = await BadgeService.listBadgeDefinitions();
  const recentAwards = await BadgeService.getAllRecentAwards();
  return apiSuccess({ definitions, recentAwards, totalDefinitions: definitions.length });
}
