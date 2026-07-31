@echo off
cd /d "%~dp0"
set PATH=%~dp0tools;%PATH%
"C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run build
exit /b %ERRORLEVEL%
