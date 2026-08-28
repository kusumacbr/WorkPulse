Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " WorkPulse - Google ADK Agent Server (sample_agent) " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$agentPath = "C:\Users\Victus\sample_agent"
$port = 8000

if (-Not (Test-Path $agentPath)) {
    Write-Host "ERROR: Agent directory not found at $agentPath" -ForegroundColor Red
    exit 1
}

Write-Host "Starting ADK API Server on http://127.0.0.1:$port..." -ForegroundColor Green
Write-Host "Target Agent: $agentPath" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the agent server." -ForegroundColor Gray

adk api_server $agentPath --port $port --auto_create_session
