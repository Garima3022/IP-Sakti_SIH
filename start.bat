@echo off
echo =========================================================================
echo               STARTING DR. AYURVEDIC SATHI PLATFORM
echo    AI Assistant for Ayurveda IP & Regulatory Guidance (Ministry of Ayush)
echo =========================================================================
echo.

echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "DR. Ayurvedic Sathi Backend" cmd /k "python backend/run.py"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Next.js Frontend on http://localhost:3000 ...
start "DR. Ayurvedic Sathi Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo =========================================================================
echo Platform Launched! Access DR. Ayurvedic Sathi at http://localhost:3000
echo =========================================================================
pause
