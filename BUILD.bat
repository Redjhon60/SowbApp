@echo off
SETLOCAL EnableDelayedExpansion
title School Manager Pro - Build (NE PAS FERMER)

color 0A
echo.
echo ============================================================
echo   School Manager Pro - Build Script
echo   NE FERMEZ PAS CETTE FENETRE
echo ============================================================
echo.

:: Navigate to script directory first
cd /d "%~dp0"
echo [INFO] Dossier: %CD%
echo.

:: Check Node.js
echo [STEP 1/4] Verification de Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [ERREUR] Node.js n'est PAS installe!
    echo.
    echo  ==> Telechargez Node.js LTS sur: https://nodejs.org
    echo  ==> Installez-le, puis relancez ce script.
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODEVER=%%i
echo [OK] Node.js: %NODEVER%

:: Install dependencies
echo.
echo [STEP 2/4] Installation des dependances...
echo  (3 a 10 minutes la premiere fois, patientez...)
echo.
set CI=false
call npm install
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [ERREUR] npm install a echoue!
    echo  - Verifiez votre connexion internet
    echo  - Essayez: clic droit sur BUILD.bat puis "Executer en tant qu'administrateur"
    echo.
    pause
    exit /b 1
)
echo [OK] Dependances OK

:: React build
echo.
echo [STEP 3/4] Compilation de l'interface...
set GENERATE_SOURCEMAP=false
call npm run react-build
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [ERREUR] Compilation React echouee - voir erreur ci-dessus
    echo.
    pause
    exit /b 1
)
echo [OK] Interface compilee

:: Electron build
echo.
echo [STEP 4/4] Creation du fichier EXE...
call npx electron-builder --win portable --x64
echo.

:: Result check
if exist "dist\SchoolManagerPro-Portable.exe" (
    color 0A
    echo ============================================================
    echo   SUCCES! Votre application est prete.
    echo   Fichier: dist\SchoolManagerPro-Portable.exe
    echo   Double-cliquez dessus pour lancer l'application!
    echo ============================================================
    echo.
    explorer "dist"
) else (
    color 0E
    echo ============================================================
    echo   Recherche de l'EXE dans dist\...
    echo ============================================================
    dir dist\ /b 2>nul || echo   (dossier dist vide ou inexistant)
    echo.
    echo   Si vous voyez un fichier .exe ci-dessus, il est utilisable.
    echo   Sinon: relancez en tant qu'Administrateur.
)

echo.
echo Appuyez sur une touche pour fermer.
pause >nul
