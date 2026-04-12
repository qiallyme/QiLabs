param(
  [string]$Name = "QID CLI"
)

$Desktop = [Environment]::GetFolderPath("Desktop")
$Here = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Split-Path -Parent $Here

$Target = Join-Path $Root "desktop\qid_ui.bat"

# IMPORTANT: set WorkDir to repo root so qid.py finds _qid_registry.json and _qid_state.json at root
$WorkDir = $Root

$Icon = Join-Path $Root "_assets\qid.ico"
$Link = Join-Path $Desktop ($Name + ".lnk")

$WScriptShell = New-Object -ComObject WScript.Shell
$Shortcut = $WScriptShell.CreateShortcut($Link)
$Shortcut.TargetPath = $Target
$Shortcut.WorkingDirectory = $WorkDir

# Windows prefers "path,0"
if (Test-Path $Icon) { 
  $Shortcut.IconLocation = "$Icon,0"
}

$Shortcut.Description = "QID CLI (Portable)"
$Shortcut.Save()

Write-Host "Created shortcut: $Link"
