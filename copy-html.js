import fs from 'fs';
import path from 'path';

// Copy all top-level .html files into public/ so Vite's build (and Vercel) will serve them as static files.
const root = process.cwd();
const publicDir = path.join(root, 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

const files = fs.readdirSync(root).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const src = path.join(root, file);
  const dest = path.join(publicDir, file);
  try {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${file} -> public/${file}`);
  } catch (err) {
    console.error(`Failed copying ${file}:`, err.message);
  }
});
