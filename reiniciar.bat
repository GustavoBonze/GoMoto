@echo off
echo Encerrando servidor anterior...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 /nobreak >nul

echo Limpando cache...
rmdir /s /q .next >nul 2>&1

echo Iniciando servidor...
start "GoMoto Dev Server" cmd /k "npm run dev"

timeout /t 5 /nobreak >nul
start http://localhost:3000
