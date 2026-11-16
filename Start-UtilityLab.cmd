@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Start-UtilityLab.ps1" %*
if errorlevel 1 pause
