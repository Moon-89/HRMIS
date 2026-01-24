@echo off
echo ==========================================
echo       AUTO-FIXING NETWORK ERROR
echo       (Deploying Backend & Frontend)
echo ==========================================
echo.

echo [STEP 1/2] Deploying Backend Code...
echo ------------------------------------
cd ..\hrmis-backend
call npx vercel --prod --yes
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Backend deployment failed.
    echo Please authenticate using "npx vercel login" manually if needed.
    pause
    exit /b
)
echo.
echo [SUCCESS] Backend Deployed!
echo.

echo [STEP 2/2] Deploying Frontend Code...
echo -------------------------------------
cd ..\hrmis-frontend
call npx vercel --prod --yes
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Frontend deployment failed.
    pause
    exit /b
)
echo.
echo [SUCCESS] Frontend Deployed!
echo.
echo ==========================================
echo       ALL SYSTEMS UPDATED
echo ==========================================
echo Please refresh your website: https://hrmis-ochre.vercel.app
echo Try logging in again.
pause
