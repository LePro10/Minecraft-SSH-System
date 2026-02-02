@echo off
set "ROOT=%~dp0"
echo [SMM Shop] Initializing Shop System...

:: Install shop dependencies
if not exist "%ROOT%node_modules\" (
    echo [SMM Shop] Installing dependencies...
    cd /d "%ROOT%" && npm install
)

:: Start Shop
echo [SMM Shop] Starting Shop...
start "SMM Shop" /d "%ROOT%" npm run dev

echo.
echo [SMM Shop] Shop is starting.
echo [SMM Shop] URL: http://localhost:3002
echo.
pause

