import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const adkUrl = process.env.ADK_AGENT_URL || "http://127.0.0.1:8000";
  const appName = process.env.ADK_APP_NAME || "sample_agent";
  const apiKeyConfigured = Boolean(process.env.GOOGLE_API_KEY);
  const configuredModel = process.env.GEMINI_MODEL || "gemini-3.6-flash";

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
    agentPath: "C:\\Users\\Victus\\sample_agent",
    model: configuredModel,
    availableApps: apps,
    latencyMs: isConnected ? latencyMs : null,
    fallbackAvailable: apiKeyConfigured,
    status: isConnected
      ? "ADK Live Server Online"
      : apiKeyConfigured
      ? "Direct Gemini Bridge Ready (ADK Offline)"
      : "Agent Configuration Pending",
  });
}
