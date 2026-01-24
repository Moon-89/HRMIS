@echo off
echo ========================================
echo HRMIS Backend Deployment Setup
echo ========================================
echo.

REM Create backend directory
if not exist "..\hrmis-backend" (
    echo Creating backend directory...
    mkdir ..\hrmis-backend
    cd ..\hrmis-backend
    
    echo Initializing npm...
    call npm init -y
    
    echo Installing dependencies...
    call npm install express cors
    
    echo Copying server file...
    copy ..\hrmis-frontend\server\mock-server.js index.js
    
    echo Creating vercel.json...
    (
        echo {
        echo   "version": 2,
        echo   "builds": [
        echo     {
        echo       "src": "index.js",
        echo       "use": "@vercel/node"
        echo     }
        echo   ],
        echo   "routes": [
        echo     {
        echo       "src": "/(.*)",
        echo       "dest": "index.js"
        echo     }
        echo   ]
        echo }
    ) > vercel.json
    
    echo.
    echo ========================================
    echo Backend setup complete!
    echo ========================================
    echo.
    echo Next steps:
    echo 1. cd ..\hrmis-backend
    echo 2. vercel (to deploy)
    echo 3. Copy the deployment URL
    echo 4. Update REACT_APP_API_URL in Vercel dashboard
    echo.
    
    cd ..\hrmis-frontend
) else (
    echo Backend directory already exists!
    echo.
)

pause
