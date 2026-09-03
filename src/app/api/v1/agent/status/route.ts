import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const FALLBACK_GEMINI_KEY = "AQ.Ab8RN6Lyd7A0EhW7_UmgbGD2v2pAxkq21Jq_vR6A2oawFHR9qw";

export async function GET() {
  const adkUrl = process.env.ADK_AGENT_URL || "http://127.0.0.1:8000";
  const appName = process.env.ADK_APP_NAME || "sample_agent";
  const apiKeyConfigured = Boolean(
    process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || FALLBACK_GEMINI_KEY
  );
  const configuredModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const isProduction = process.env.NODE_ENV === "production";

  let isConnected = false;
  let apps: string[] = [];
  let latencyMs = 0;

  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    const response = await fetch(`${adkUrl}/list-apps`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      apps = await response.json();
      isConnected = true;
      latencyMs = Date.now() - startTime;
    }
  } catch {
    isConnected = false;
  }

  return NextResponse.json({
    connected: isConnected,
    appName,
    agentUrl: adkUrl,
    agentPath: process.env.ADK_AGENT_PATH || (isProduction ? "Cloud / Gemini Bridge" : "C:\\Users\\Victus\\sample_agent"),
    model: configuredModel,
    availableApps: apps,
    latencyMs: isConnected ? latencyMs : null,
    fallbackAvailable: apiKeyConfigured,
    status: isConnected
      ? "ADK Live Server Online"
      : apiKeyConfigured
      ? "Direct Gemini Bridge Ready (ADK Offline)"
      : isProduction
      ? "Configuration Required (Add GOOGLE_API_KEY in Hosting Env)"
      : "Agent Configuration Pending",
  });
}
