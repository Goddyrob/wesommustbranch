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

// Also copy css/ and js/ directories so static references in the HTML work
function copyDirIfExists(dirName) {
  const srcDir = path.join(root, dirName);
  const destDir = path.join(publicDir, dirName);
  if (!fs.existsSync(srcDir)) return;
  // recursive copy
  const ncp = (src, dest) => {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(item => {
      const s = path.join(src, item);
      const d = path.join(dest, item);
      if (fs.statSync(s).isDirectory()) ncp(s, d);
      else fs.copyFileSync(s, d);
    });
  };
  try {
    ncp(srcDir, destDir);
    console.log(`Copied ${dirName}/ -> public/${dirName}/`);
  } catch (err) {
    console.error(`Failed copying ${dirName}:`, err.message);
  }
}

copyDirIfExists('css');
copyDirIfExists('js');

// Inject build-time env into copied HTML so client code can read it when not processed by Vite
const envScript = `\n<script>window.__ENV = { VITE_SUPABASE_URL: ${JSON.stringify(process.env.VITE_SUPABASE_URL || '')}, VITE_SUPABASE_ANON_KEY: ${JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || '')} };</script>\n`;

files.forEach(file => {
  const dest = path.join(publicDir, file);
  try {
    let html = fs.readFileSync(dest, 'utf8');
    // inject before closing </head>
    if (html.includes('</head>')) {
      html = html.replace('</head>', envScript + '</head>');
      fs.writeFileSync(dest, html, 'utf8');
      console.log(`Injected env into public/${file}`);
    }
  } catch (err) {
    console.error(`Failed injecting env into ${file}:`, err.message);
  }
});
