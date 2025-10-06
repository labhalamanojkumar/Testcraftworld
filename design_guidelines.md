# Design Guidelines: SEO-Optimized Blogging Platform

## Design Approach
**Reference-Based Approach**: Drawing from Medium and Ghost's reader-first philosophy with strategic ad placement optimization. Clean, typography-focused design that balances content readability with monetization opportunities.

## Core Design Elements

### A. Color Palette
**Light Mode (Primary)**
- Primary: #1A202C (charcoal) - Headers, navigation, emphasis
- Secondary: #2D3748 (slate) - Body text, secondary elements
- Background: #FFFFFF (white) - Main background, cards
- Accent: #3182CE (blue) - Links, CTAs, interactive elements
- Success: #38A169 (green) - Publishing indicators, success states
- Neutral: #F7FAFC (off-white) - Subtle backgrounds, ad zones
- Border: #E2E8F0 (light grey) - Dividers, card borders

**Dark Mode (Optional Reading Mode)**
- Background: #1A202C
- Text: #E2E8F0
- Cards: #2D3748

### B. Typography
**Content Typography (Serif)**
- Primary: Georgia with Merriweather fallback
- Article titles: 2.5rem (40px) font-bold leading-tight
- Article body: 1.125rem (18px) leading-relaxed (1.75)
- Block quotes: 1.25rem italic with left border accent
- Optimal reading width: max-w-2xl (672px)

**UI Typography (Sans-serif)**
- Primary: Inter with Open Sans fallback
- Navigation: 0.875rem (14px) font-medium
- Category labels: 0.75rem (12px) uppercase tracking-wide
- Meta information: 0.875rem (14px) text-slate-600
- Buttons: 0.875-1rem font-semibold

### C. Layout System
**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20 for consistency
- Section padding: py-12 (mobile), py-20 (desktop)
- Component gaps: gap-6 to gap-8
- Content margins: mb-6 for paragraphs, mb-8 for sections

**Grid System**
- Container: max-w-7xl mx-auto px-4
- Article content: max-w-2xl mx-auto (optimal reading)
- Sidebar: w-80 (320px) for ads and widgets
- Card grids: grid-cols-1 md:grid-cols-2 lg:grid-cols-3

### D. Component Library

**Navigation**
- Fixed top navigation with white background, subtle shadow
- Logo left-aligned, category navigation center, search/CTA right
- Mobile: Hamburger menu with slide-in drawer
- Categories dropdown with 6 primary topics

**Hero Section**
- Featured article carousel with 3-5 top stories
- Large image (16:9 aspect ratio), title overlay with gradient
- Category badge, author info, read time
- Height: 500px desktop, 400px mobile

**Article Cards**
- Horizontal card layout: Image left (250px), content right
- Vertical card for grid: Image top (16:9), content below
- Elements: Thumbnail, category badge, title (2-3 lines), excerpt (2 lines), author avatar, date, read time
- Hover state: Subtle shadow elevation, image scale 1.05

**Article Page Layout**
- Single column: Article content max-w-2xl centered
- Sidebar: Right-aligned (300px) with AdSense zones, related posts
- Floating social share buttons (left side on desktop)
- Progress bar at top showing reading progress

**Rich Text Editor**
- Toolbar: Bold, italic, headings, lists, quotes, links, images
- Markdown support with live preview split view
- Image upload with drag-and-drop
- SEO fields: Meta title, description, focus keyword, slug editor

**AdSense Zones** (Designated with subtle borders #E2E8F0)
- Header leaderboard: 728x90 (desktop), 320x50 (mobile)
- Sidebar: 300x250 rectangles (2-3 units)
- In-content: 300x250 after 2nd paragraph, 728x90 after 5th paragraph
- Footer: 728x90 leaderboard
- Background: #F7FAFC for clear ad zone distinction

**Category Pages**
- Category header with icon, description, post count
- Filter bar: Sort (latest, popular, trending), tags
- Article grid: 2-3 columns with card layout
- Infinite scroll or pagination

**Footer**
- Three columns: About/description, categories, social links
- Newsletter subscription form with email input
- Copyright, privacy policy, terms of service links
- Background: #F7FAFC with border-top

### E. Content Presentation
**Article Structure**
- Hero image (16:9, 1200x675px minimum)
- Title with category badge above
- Author info bar: Avatar, name, date, read time, social share
- Table of contents for long articles (auto-generated from H2s)
- Pull quotes with left accent border (#3182CE, 4px)
- Related articles at bottom (3-card horizontal layout)

**SEO Elements (Visible)**
- Breadcrumb navigation
- Schema markup indicators in dev mode
- Social share preview cards
- Prominent category and tag labels

### F. Responsive Behavior
**Breakpoints**
- Mobile: < 768px (single column, stacked cards)
- Tablet: 768-1024px (2-column grids, visible sidebar)
- Desktop: > 1024px (3-column grids, full layout)

**Mobile Optimizations**
- Hamburger menu for navigation
- Single column article layout
- Smaller ad units (320x50, 300x250)
- Collapsible sidebar widgets
- Touch-friendly button sizes (min 44x44px)

## Images
**Hero Section**: Use a large, high-quality hero image (1920x600px) showcasing content creation/blogging theme - laptop with blog content, writing desk, or abstract content patterns. Place on homepage above featured articles carousel.

**Article Thumbnails**: Each article requires 16:9 featured image (1200x675px minimum). Images should be relevant to category themes - business graphs, design mockups, technology gadgets, lifestyle scenes, news imagery, marketing concepts.

**Author Avatars**: Circular profile images (80x80px) for bylines and author bios.

## Interaction Patterns
- Smooth scroll to sections
- Hover elevation on cards (shadow-md to shadow-lg)
- Loading skeletons for content fetching
- Toast notifications for publish/save actions
- Modal for image lightbox in articles