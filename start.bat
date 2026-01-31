@echo off
set "ROOT=%~dp0"
echo [SMM] Initializing SSH MC Manager...

:: Start Backend
start "SMM Backend" cmd /c "cd /d %ROOT% && node backend/src/server.js"

:: Start Frontend
start "SMM Frontend" cmd /c "cd /d %ROOT%frontend && npm run dev"

echo [SMM] Both services are starting in separate windows.
echo [SMM] Frontend: http://localhost:5173
echo [SMM] Backend: http://localhost:3001
pause