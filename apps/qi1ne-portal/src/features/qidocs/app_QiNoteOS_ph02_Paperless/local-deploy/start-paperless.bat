@echo off
echo Starting Paperless-ngx...
cd /d "%~dp0"

echo Ensure Docker is running...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker is not running! Please start Docker Desktop and try again.
    pause
    exit /b
)

echo Starting Containers...
docker-compose up -d

echo Waiting for services to initialize...
timeout /t 5 /nobreak >nul

echo Opening Paperless-ngx...
start http://localhost:8000
