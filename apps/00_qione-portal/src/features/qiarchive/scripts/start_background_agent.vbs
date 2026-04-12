Set WshShell = CreateObject("WScript.Shell")
' Run the python script silently (0) and don't wait (false)
' We use triple quotes to handle paths with potential spaces
WshShell.Run """C:\Python314\python.exe"" ""C:\QiLabs\QiArchive\app\agent\pipeline.py""", 0, False

' Launch the Status Overlay visibly (1)
WshShell.Run """C:\Python314\python.exe"" ""C:\QiLabs\QiArchive\app\agent\status_overlay.py""", 1, False
