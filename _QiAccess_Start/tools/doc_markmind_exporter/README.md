# Doc MarkMind Exporter

Prototype QiAccess local toolbox module for exporting a folder tree into a MarkMind-compatible Markdown mind map outline.

## Required Module Structure

Standalone/proven tools use this structure:

```text
tools\doc_markmind_exporter\
  README.md
  __init__.py
  doc_markmind_exporter.py
  manifest.yaml
```

This prototype follows the required folder-name-is-tool-name convention and can later move to `C:\QiLabs\toolbox\tools\doc_markmind_exporter\` if it becomes a proven shared tool.

## Purpose

- Walk a target folder recursively.
- Include folders plus preferred documentation/config file types in a MarkMind-compatible Markdown outline.
- Support a conservative `--include-all` mode for non-preferred text files.

## Example Commands

Export a target folder using the default output path:

```powershell
python .\tools\doc_markmind_exporter\doc_markmind_exporter.py .\docs\10_blueprint
```

Export `docs\10_blueprint` to the diagrams folder:

```powershell
python .\tools\doc_markmind_exporter\doc_markmind_exporter.py .\docs\10_blueprint --out .\docs\10_blueprint\assets\diagrams\blueprint_map.md --force
```

Export with a custom title:

```powershell
python .\tools\doc_markmind_exporter\doc_markmind_exporter.py .\docs\10_blueprint --title "QiAccess Blueprint Map" --force
```

Export with deeper or broader scanning:

```powershell
python .\tools\doc_markmind_exporter\doc_markmind_exporter.py .\docs\10_blueprint --max-depth 4
python .\tools\doc_markmind_exporter\doc_markmind_exporter.py .\docs\10_blueprint --include-all --force
```

## Exporting `docs\10_blueprint`

Recommended prototype command:

```powershell
python .\tools\doc_markmind_exporter\doc_markmind_exporter.py .\docs\10_blueprint --out .\docs\10_blueprint\assets\diagrams\blueprint_map.md --force
```

Default output without `--out` will be:

```text
docs\10_blueprint\_markmind_export.md
```

## Opening in Obsidian / MarkMind

1. Generate the Markdown output file.
2. Open the vault in Obsidian.
3. Open the generated `.md` file.
4. If MarkMind is installed, open the file in MarkMind basic mode and use the outline as the source map.

## Notes

- This tool does not call any MarkMind API.
- Output is plain Markdown with `mindmap-plugin: basic` front matter.
- The scan is read-only except for writing the selected output file.
- Existing output files are not overwritten unless `--force` is provided.
