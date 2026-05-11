# QiLife Mini App Template

Self-contained, portable mini app. One folder, one venv, zero drama.

## Quick start
1) PowerShell: `scripts\venv_setup.ps1`
2) Run: `run.bat run`
3) Package zip: `scripts\package.ps1`

Expose your features in `src/miniapp/logic.py` and wire them in `app.py`.
This template is Cockpit-ready: `miniapp.json` tells the launcher how to run it.
