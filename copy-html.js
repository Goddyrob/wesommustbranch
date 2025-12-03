import fs from 'fs';
import path from 'path';

// If a local .env file exists, load it so process.env contains VITE_* variables
// when this script runs locally (avoids needing dotenv as a dependency).
function loadDotEnvIfPresent() {
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) return;
    const contents = fs.readFileSync(envPath, 'utf8');
    contents.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const idx = trimmed.indexOf('=');
      if (idx === -1) return;
      const key = trimmed.slice(0, idx).trim();
      let value = trimmed.slice(idx + 1).trim();
      // remove surrounding quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (key && (typeof process.env[key] === 'undefined' || process.env[key] === '')) {
        process.env[key] = value;
      }
    });
    console.log('Loaded local .env into process.env');
  } catch (e) {
    // non-fatal
    console.warn('Could not load .env file:', e && e.message);
  }
}

loadDotEnvIfPresent();

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
