@echo off
echo Starting Local Service Marketplace...

:: Start the backend in a new window
echo Starting Backend...
start "Backend Server" cmd /k "cd backend && npm run dev"

:: Start the frontend in a new window
echo Starting Frontend...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo Both servers are starting up!
echo You can safely close this empty window.
