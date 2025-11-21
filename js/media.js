import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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
