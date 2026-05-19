import { existsSync, readdirSync, rmSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

const docsDir = join(process.cwd(), 'docs');
const gitDir = join(docsDir, '.git');
const docsMarkers = ['_index.md', '10_core', '20_qinexus', '30_qiarchive', '40_system'];

console.log('--- QiDocs Preparation Step ---');

if (existsSync(docsDir)) {
  if (existsSync(gitDir)) {
    console.log('Docs folder exists with nested git tracking. Skipping clone to preserve local changes.');
  } else if (hasDocsContent()) {
    console.log('Docs folder exists in the repo checkout and already contains source content. Skipping clone.');
  } else if (shouldCloneDocs()) {
    console.log('Docs folder exists but is empty or incomplete. Re-initializing from GitHub...');
    rmSync(docsDir, { recursive: true, force: true });
    cloneDocs();
  } else {
    failMissingDocs();
  }
} else if (shouldCloneDocs()) {
  console.log('Docs folder not found. Cloning from GitHub...');
  cloneDocs();
} else {
  failMissingDocs();
}

function hasDocsContent() {
  if (!existsSync(docsDir)) {
    return false;
  }

  if (docsMarkers.some((marker) => existsSync(join(docsDir, marker)))) {
    return true;
  }

  return readdirSync(docsDir).length > 0;
}

function shouldCloneDocs() {
  return process.env.QIDOCS_ALLOW_CLONE === '1';
}

function failMissingDocs() {
  console.error('QiDocs source is missing from docs/. This build does not auto-clone docs unless QIDOCS_ALLOW_CLONE=1 is set.');
  process.exit(1);
}

function cloneDocs() {
  try {
    execSync('git clone --depth 1 https://github.com/qiallyme/QiDocs.git docs', { stdio: 'inherit' });
    console.log('QiDocs cloned successfully.');
  } catch (error) {
    console.error('Failed to clone QiDocs:', error.message);
    process.exit(1);
  }
}
