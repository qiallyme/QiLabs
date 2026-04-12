Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

desktopPath = WshShell.SpecialFolders("Desktop")
here = fso.GetParentFolderName(WScript.ScriptFullName) '...\desktop
root = fso.GetParentFolderName(here)                   '...\QID_CLI_PORTABLE

target = root & "\desktop\qid_ui.bat"
workDir = root & "\app"
iconPath = root & "\_assets\qid.ico"
linkPath = desktopPath & "\QID CLI.lnk"

Set shortcut = WshShell.CreateShortcut(linkPath)
shortcut.TargetPath = target
shortcut.WorkingDirectory = workDir
If fso.FileExists(iconPath) Then
  shortcut.IconLocation = iconPath
End If
shortcut.WindowStyle = 1
shortcut.Description = "QID CLI (Portable)"
shortcut.Save

WScript.Echo "Created shortcut: " & linkPath
