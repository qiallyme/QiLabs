@echo off
setlocal enabledelayedexpansion

echo ========================================
echo QiOS Blueprint Rebuild
echo The primary operator entry point. Runs front matter normalization, structure
echo enforcement, generated artifact refresh (indexes / markmind), local MkDocs build
echo validation, and Git publish steps in sequence.
echo ========================================

REM 1. Normalize front matter
python scripts\normalize_front_matter.py docs adr templates
if errorlevel 1 goto :fail

REM 2. Enforce structure + registry/schema validation
python scripts\enforce_structure.py
if errorlevel 1 goto :fail

REM 3. Regenerate Markmind from actual tree/nav
python scripts\generate_markmind.py
if errorlevel 1 goto :fail

REM 4. Rebuild docs indexes/catalogs if you add that later
REM python scripts\update_indexes.py
REM if errorlevel 1 goto :fail

REM 5. Build site as validation
mkdocs build
if errorlevel 1 goto :fail

REM 6. Git add / commit / push
git add .
git commit -m "docs: rebuild blueprint"
if errorlevel 1 echo No commit created (possibly no changes)

git push
if errorlevel 1 goto :fail

echo.
echo SUCCESS: Blueprint rebuilt and pushed.
goto :eof

:fail
echo.
echo FAILED: Blueprint rebuild halted.
exit /b 1