@echo off
set "ROOT=%~dp0"
echo [SMM] Initializing SSH MC Manager...

:: Install root dependencies (Backend)
if not exist "%ROOT%node_modules\" (
    echo [SMM] Installing backend dependencies in root...
    npm install
)

:: Install frontend dependencies
if not exist "%ROOT%frontend\node_modules\" (
    echo [SMM] Installing frontend dependencies...
    cd /d "%ROOT%frontend" && npm install
)

:: Start Backend (running from root since package.json and node_modules are there)
echo [SMM] Starting Backend...
start "SMM Backend" node backend/src/server.js

:: Start Frontend
echo [SMM] Starting Frontend...
start "SMM Frontend" /d "%ROOT%frontend" npm run dev

echo.
echo [SMM] Both services are starting in separate windows.
echo [SMM] Frontend: http://localhost:5173
echo [SMM] Backend: http://localhost:3001
echo.
pause