@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0quick-docker-setup.ps1" %*
exit /b %errorlevel%
