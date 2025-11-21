# WESO Website - Western Outreach Ministries

![WESO Logo](https://mmustcu.org/img/wesoLogo.jfif)

**Winning Souls for Christ**

A complete, modern website for Western Outreach Ministries (WESO) - the evangelism department of Masinde Muliro University Christian Union (MMUST CU).

## Features

### Core Features
- ✅ Fully responsive design (mobile, tablet, desktop)
- ✅ Modern animations and transitions
- ✅ WESO branding (Navy Blue #002147 & Gold #FFD700)
- ✅ Fast loading with optimized images
- ✅ SEO-friendly structure

### Pages
- **Home** - Hero section, ministry pillars, recent events
- **About** - Mission, vision, values, leadership team
- **Wings** - Six ministry departments with descriptions
- **Media** - Database-driven photo album gallery
- **Events** - Upcoming and past events listing
- **Registration** - Member registration form
- **Contact** - Contact form with map integration

### Advanced Features
- **📸 Media Album Management**
  - Admin interface for managing photo albums
  - Google Drive integration for photo storage
  - Category filtering and search
  - Hide/show albums without deleting
  - Supabase database backend

- **📝 Form Integration**
  - Registration form (Google Sheets ready)
  - Contact form (Google Sheets ready)
  - Client-side validation
  - Success/error feedback

- **🎨 Interactive Elements**
  - Scroll animations
  - Sticky navigation
  - Mobile menu
  - Hover effects
  - Smooth scrolling

## Quick Start

### 1. Media Management (NEW!)

**Add Your First Album:**
1. Go to `admin-media.html`
2. Upload photos to Google Drive and make folder public
3. Copy the Folder ID from the Drive URL
4. Fill in the album details and submit
5. Album appears instantly on media page!

See [MEDIA_ADMIN_GUIDE.md](MEDIA_ADMIN_GUIDE.md) for detailed instructions.

### 2. Forms Setup

Connect registration and contact forms to Google Sheets:
1. Create a Google Sheet
2. Set up Apps Script (code provided in SETUP_INSTRUCTIONS.md)
3. Update form URLs in register.html and contact.html

See [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) for complete setup guide.

### 3. Customization

**Update Contact Info:**
- Search for `weso@mmustcu.org` and replace with your email
- Search for `+254 712 345 678` and replace with your phone

**Update Social Media:**
- Update Facebook, Instagram, YouTube links in footer

**Update Colors (optional):**
- Edit `css/style.css` root variables

## File Structure

```
weso-website/
├── index.html              # Home page
├── about.html              # About page
├── wings.html              # Ministry wings
├── media.html              # Photo gallery
├── admin-media.html        # Media management admin
├── events.html             # Events listing
├── register.html           # Registration form
├── contact.html            # Contact form
├── css/
│   └── style.css          # Main stylesheet
├── js/
│   ├── script.js          # Navigation & animations
│   ├── events.js          # Events data
│   └── media.js           # Media album management
├── SETUP_INSTRUCTIONS.md   # Detailed setup guide
├── MEDIA_ADMIN_GUIDE.md    # Media management guide
└── README.md               # This file
```

## Technology Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Database:** Supabase (PostgreSQL)
- **Storage:** Google Drive (for photos)
- **Forms:** Google Apps Script + Sheets
- **Fonts:** Google Fonts (Poppins, Inter)
- **Images:** Pexels stock photos
- **Build:** Vite

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Database Schema

### media_albums Table
```sql
- id (uuid, primary key)
- title (text)
- description (text)
- folder_id (text) - Google Drive folder ID
- category (text)
- event_date (date)
- cover_image (text)
- is_active (boolean)
- created_at (timestamptz)
- updated_at (timestamptz)
```

## Admin Access

**Media Admin:** `https://your-domain.com/admin-media.html`

**Important:** Consider adding password protection via your hosting provider's settings.

## Key Features Explained

### Media Album System
- Albums are stored in Supabase database
- Photos are hosted on Google Drive (no server storage needed)
- Admin can add/edit/hide albums without coding
- Public page fetches albums in real-time
- Category filtering for easy browsing

### Form Integration
- Forms submit to Google Sheets via Apps Script
- No server-side code required
- Email notifications can be added in Apps Script
- Data is automatically organized in spreadsheet

## Credits

- **Client:** WESO - MMUST CU
- **Developer:** Godswill Web Solutions
- **Database:** Supabase
- **Photos:** Pexels
- **Fonts:** Google Fonts

## License

© 2025 Western Outreach Ministries (WESO) - MMUST CU. All rights reserved.

---

**Built with ❤️ for the Kingdom of God**

*"Go into all the world and preach the gospel to all creation." - Mark 16:15*
