@echo off
setlocal

:: Configuration
set SERVER_USER=qiadmin
set SERVER_IP=100.121.111.106
set LOCAL_PATH=local/config
set REMOTE_PATH=/srv/qios/stacks/_qiaccess_start/config

echo [Quantum Sync] Initiating transfer to %SERVER_IP%...
echo [Quantum Sync] Source: %LOCAL_PATH%
echo [Quantum Sync] Destination: %REMOTE_PATH%

:: Sync the branding configuration
scp -r "%LOCAL_PATH%\*" %SERVER_USER%@%SERVER_IP%:%REMOTE_PATH%/

if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Branding synchronized successfully.
) else (
    echo [ERROR] Synchronization failed. Check connection or paths.
)

pause
