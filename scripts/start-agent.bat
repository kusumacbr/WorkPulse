@echo off
title WorkPulse - Google ADK Agent Server (sample_agent)
echo ==========================================================
echo  WorkPulse - Google ADK Agent Server (sample_agent)
echo ==========================================================

set AGENT_PATH=C:\Users\Victus\sample_agent
set PORT=8000

if not exist "%AGENT_PATH%" (
    echo [ERROR] Agent directory not found at %AGENT_PATH%
    pause
    exit /b 1
)

echo Starting ADK API Server on http://127.0.0.1:%PORT%...
echo Target Agent: %AGENT_PATH%
echo.

adk api_server "%AGENT_PATH%" --port %PORT% --auto_create_session
