# QiArchive Agent Service Registration
# This script creates a Windows Task Scheduler task to run the agent on startup.

$TaskName = "QiArchiveAgent"
$Description = "Background document ingestion watcher for QiArchive."
$PythonPath = "C:\Python314\python.exe"
$ScriptPath = "C:\QiLabs\QiArchive\app\agent\pipeline.py"

# Define the action (Run the Python script)
$Action = New-ScheduledTaskAction -Execute $PythonPath -Argument $ScriptPath -WorkingDirectory "C:\QiLabs\QiArchive"

# Define the trigger (At logon)
$Trigger = New-ScheduledTaskTrigger -AtLogOn

# Define settings (Stop if it runs too long, etc)
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Hours 24)

# Create/Update the task
try {
    Register-ScheduledTask -TaskName $TaskName -Description $Description -Action $Action -Trigger $Trigger -Settings $Settings -Force
    Write-Host "`n✅ SUCCESS: QiArchive Agent task created."
    Write-Host "It will now run automatically whenever you log into Windows.`n"
} catch {
    Write-Host "`n❌ ERROR: Failed to create task. Please run this terminal as Administrator.`n"
}
