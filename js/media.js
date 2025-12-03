import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Defensive env resolution for static deployments where import.meta.env
// isn't available at runtime. Prefer runtime-injected `window.__ENV`.
function resolveEnv() {
  const runtime = (window.__ENV && typeof window.__ENV === 'object') ? window.__ENV :
    (window.__IMPORT_META && typeof window.__IMPORT_META === 'object') ? window.__IMPORT_META :
    (window._env && typeof window._env === 'object') ? window._env : null;

  if (runtime && runtime.VITE_SUPABASE_URL && runtime.VITE_SUPABASE_ANON_KEY) {
    return { VITE_SUPABASE_URL: runtime.VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY: runtime.VITE_SUPABASE_ANON_KEY };
  }

  try {
    if (typeof import !== 'undefined' && typeof import.meta !== 'undefined' && import.meta.env) {
      return { VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '', VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '' };
    }
  } catch (e) {
    // ignore restricted environments
  }

  return { VITE_SUPABASE_URL: (runtime && runtime.VITE_SUPABASE_URL) || '', VITE_SUPABASE_ANON_KEY: (runtime && runtime.VITE_SUPABASE_ANON_KEY) || '' };
}

const env = resolveEnv();
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseKey = env.VITE_SUPABASE_ANON_KEY || '';
let supabase = null;
if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase env not found for media.js — requests will fail until VITE_* vars are injected at build/runtime');
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (e) {
    console.error('Failed to create Supabase client in media.js', e);
    supabase = null;
  }
}

let allAlbums = [];

const defaultCoverImages = {
  "Campus Missions": "https://images.pexels.com/photos/8468092/pexels-photo-8468092.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Street Evangelism": "https://images.pexels.com/photos/5206963/pexels-photo-5206963.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Hospital Visits": "https://images.pexels.com/photos/8460207/pexels-photo-8460207.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Market Outreach": "https://images.pexels.com/photos/3270224/pexels-photo-3270224.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Prison Ministry": "https://images.pexels.com/photos/9347693/pexels-photo-9347693.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Other Events": "https://images.pexels.com/photos/7163619/pexels-photo-7163619.jpeg?auto=compress&cs=tinysrgb&w=800"
};

async function loadAlbums() {
  const loadingSpinner = document.getElementById('loading-spinner');
  const albumsGrid = document.getElementById('albums-grid');

  try {
    if (!supabase) {
      if (loadingSpinner) loadingSpinner.style.display = 'none';
      albumsGrid.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1;">Supabase not configured. Albums cannot be loaded.</p>';
      return;
    }
    const { data, error } = await supabase
      .from('media_albums')
      .select('*')
      .eq('is_active', true)
      .order('event_date', { ascending: false });

    if (error) throw error;

    allAlbums = data || [];

    if (loadingSpinner) {
      loadingSpinner.style.display = 'none';
    }

    if (allAlbums.length === 0) {
      albumsGrid.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1;">No albums available yet. Check back soon!</p>';
      return;
    }

    // Render albums (no filter UI) and display cards
    renderAlbums(allAlbums);
  } catch (error) {
    if (loadingSpinner) {
      loadingSpinner.style.display = 'none';
    }
    albumsGrid.innerHTML = '<p style="text-align: center; color: #dc3545; grid-column: 1/-1;">Error loading albums. Please refresh the page.</p>';
  }
}


function renderAlbums(albums) {
  const albumsGrid = document.getElementById('albums-grid');

  if (albums.length === 0) {
    albumsGrid.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1;">No albums found in this category.</p>';
    return;
  }

  albumsGrid.innerHTML = albums.map(album => {
    // Use album cover if present, otherwise use the WESO logo as a consistent default
    const defaultLogo = 'https://mmustcu.org/img/wesoLogo.jfif';
    const coverImage = (album.cover_image && album.cover_image.toString().trim()) ? album.cover_image : defaultLogo;
    let eventDate = 'No date';
    if (album.event_date) {
      const d = new Date(album.event_date);
      if (!isNaN(d.getTime())) {
        eventDate = d.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    }
    // Render a card; the album title is the link to Google Drive
    return `
      <div class="wing-card fade-in" style="cursor: default;">
        <img src="${coverImage}" alt="${album.title}" style="height: 250px; object-fit: cover;">
        <div class="wing-content">
          <h3><a class="album-title-link" href="https://drive.google.com/drive/folders/${album.folder_id}" target="_blank">${album.title}</a></h3>
          <p class="date" style="color: var(--gold); font-weight: 600; margin-bottom: 0.5rem;">
            📅 ${eventDate}
          </p>
          <p style="margin-bottom: 1rem;">${album.description || 'Click the album title to view photos'}</p>
          <a class="wing-button wing-button-link" href="https://drive.google.com/drive/folders/${album.folder_id}" target="_blank">View Album</a>
        </div>
      </div>
    `;
  }).join('');

  // Attach explicit navigation handlers so clicks reliably navigate
  // (some hosts or environments may block or override anchor behavior)
  requestAnimationFrame(() => {
    // Attach handlers to the album title links so they open in a new tab
      const titleLinks = document.querySelectorAll('.album-title-link');
      titleLinks.forEach(a => {
        if (a._navAttached) return;
        a._navAttached = true;
        a.addEventListener('click', (e) => {
          // allow modifier-key clicks to proceed normally
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          e.preventDefault();
          // Open in a new tab explicitly (less likely to be blocked) and use noopener for safety
          window.open(a.href, '_blank', 'noopener');
        });
      });

      // Attach same behaviour to view buttons (open new tab)
      const buttons = document.querySelectorAll('.wing-button-link');
      buttons.forEach(b => {
        if (b._navAttached) return;
        b._navAttached = true;
        b.addEventListener('click', (e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          e.preventDefault();
          window.open(b.href, '_blank', 'noopener');
        });
      });
  });
  // Remove `.fade-in` invisibility by adding the visible class after render
  requestAnimationFrame(() => {
    try {
      const fadeEls = albumsGrid.querySelectorAll('.fade-in');
      fadeEls.forEach(el => el.classList.add('visible'));
    } catch (e) {
      // ignore
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadAlbums();
});

// Subscribe to realtime changes on the media_albums table so the gallery updates automatically
supabase.channel('public:media_albums')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'media_albums' }, () => {
    loadAlbums();
  })
  .subscribe();
