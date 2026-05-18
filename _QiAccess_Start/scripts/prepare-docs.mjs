import { existsSync, rmSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

const docsDir = join(process.cwd(), 'docs');
const gitDir = join(docsDir, '.git');

console.log('--- QiDocs Preparation Step ---');

if (existsSync(docsDir)) {
  if (existsSync(gitDir)) {
    console.log('✅ Docs folder exists and has active git tracking. Skipping clone to preserve local changes.');
  } else {
    console.log('⚠️ Docs folder exists but has no .git tracking (submodule gitlink empty). Re-initializing...');
    rmSync(docsDir, { recursive: true, force: true });
    cloneDocs();
  }
} else {
  console.log('🔍 Docs folder not found. Cloning from GitHub...');
  cloneDocs();
}

function cloneDocs() {
  try {
    execSync('git clone --depth 1 https://github.com/qiallyme/QiDocs.git docs', { stdio: 'inherit' });
    console.log('✅ QiDocs cloned successfully.');
  } catch (error) {
    console.error('❌ Failed to clone QiDocs:', error.message);
    process.exit(1);
  }
}
