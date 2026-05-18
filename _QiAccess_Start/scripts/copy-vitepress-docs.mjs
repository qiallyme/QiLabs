import fs from 'fs';
import path from 'path';

const srcDir = path.resolve(process.cwd(), '.vitepress-dist');
const destDir = path.resolve(process.cwd(), 'dist/docs');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(function(childItemName) {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log(`Copying docs from ${srcDir} to ${destDir}...`);
if (fs.existsSync(srcDir)) {
  copyRecursiveSync(srcDir, destDir);
  console.log('Docs copied successfully.');
} else {
  console.error(`Source directory ${srcDir} does not exist. Did VitePress build correctly?`);
  process.exit(1);
}
