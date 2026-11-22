@echo off
cd /d "%~dp0"
title FIXORA - Dev Server
echo Starting FIXORA (web, api, assets)...
echo.
npm run dev
pause
