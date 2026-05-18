# QiAccess Docs Site

This site layer builds a static documentation site from the source `docs/` tree without editing the source docs.

## Commands

- `npm run docs:sync`: inspect the source `docs/` tree and report what MkDocs will build.
- `npm run docs:build`: generate a source-preserving runtime copy and build the static site into `.runtime/mkdocs/runs/<timestamp>/site`.
- `npm run docs:serve`: inspect the source docs and run a local MkDocs server.

## Notes

- Source markdown stays in `docs/`.
- Hidden Obsidian/runtime folders are excluded from the generated site.
- The generated publish tree lives under `.runtime/`.
- `_index.md` and `README.md` source section pages are normalized only inside the generated runtime copy.
