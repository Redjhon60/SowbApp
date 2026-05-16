@echo off
title School Manager Pro - Mode Developpement

echo.
echo ============================================================
echo   School Manager Pro - Demarrage en mode Developpement
echo ============================================================
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js requis! Telecharger sur nodejs.org
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo Installation des dependances...
    call npm install
)

echo Demarrage de l'application...
echo (Fermez cette fenetre pour arreter)
echo.
call npm start
