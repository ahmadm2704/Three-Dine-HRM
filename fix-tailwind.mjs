import fs from 'fs';
import path from 'path';

const dir = 'src/components/ui';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace x-(--var) with x-[var(--var)]
  content = content.replace(/([a-zA-Z0-9_-]+)-\(--([a-zA-Z0-9_-]+)\)/g, '$1-[var(--$2)]');
  
  // Replace var(--radius-md) with var(--radius)
  content = content.replace(/var\(--radius-md\)/g, 'var(--radius)');
  
  // Remove size-* arbitrary classes if they cause issues, but size-4 is valid in tailwind v3 if we have a plugin or just w-4 h-4
  // Actually Tailwind 3.4 supports `size-4` natively, so size-4 is fine.
  
  fs.writeFileSync(filePath, content);
  console.log(`Processed ${filePath}`);
}

const files = fs.readdirSync(dir);
for (const file of files) {
  if (file.endsWith('.tsx')) {
    processFile(path.join(dir, file));
  }
}
