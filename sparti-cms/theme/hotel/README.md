# Hotel Theme (`sparti-cms/theme/hotel`)

This theme provides a complete hotel booking experience with room listings, filtering, and reservation functionality.

## Features

- **Hero Slider**: Full-screen image carousel with autoplay
- **Room Search**: Filter rooms by guest count (adults and kids)
- **Room Listings**: Grid display of available rooms with details
- **Room Details**: Detailed view with facilities, pricing, and booking form
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Date Pickers**: Check-in and check-out date selection
- **Custom Styling**: Gold accent color (#a37d4c) with elegant typography

## Structure

```
sparti-cms/theme/hotel/
├── index.tsx                      # Main theme entry
├── theme.json                     # Theme metadata
├── pages.json                     # Page definitions
├── theme.css                      # Custom hotel styles
├── types.ts                       # TypeScript interfaces
├── README.md                      # This file
├── assets/
│   ├── hero/                      # Hero slider images (1-3.jpg)
│   ├── logos/                     # Logo variants (dark/white)
│   └── rooms/                     # Room images (1-8.png, 1-8-lg.png)
├── components/
│   ├── layout/
│   │   ├── Header.tsx             # Sticky header with scroll effect
│   │   └── Footer.tsx             # Footer with logo and copyright
│   ├── booking/
│   │   ├── BookForm.tsx           # Main booking form
│   │   ├── CheckIn.tsx            # Check-in date picker
│   │   ├── CheckOut.tsx           # Check-out date picker
│   │   ├── AdultsDropdown.tsx     # Adults selector
│   │   └── KidsDropdown.tsx       # Kids selector
│   └── rooms/
│       ├── HeroSlider.tsx         # Hero image carousel
│       ├── Rooms.tsx              # Room grid with filtering
│       └── Room.tsx               # Individual room card
├── context/
│   └── RoomContext.tsx            # Room filtering state management
├── data/
│   ├── rooms.ts                   # Room data (8 rooms)
│   └── constants.ts               # Dropdown lists, slider data, hotel rules
├── pages/
│   ├── HomePage.tsx               # Home page with hero, booking, and rooms
│   └── RoomDetailsPage.tsx        # Room details with booking sidebar
└── utils/
    └── ScrollToTop.tsx            # Utility to scroll to top on route change
```

## Pages

### Homepage (`/`)

- Full-screen hero slider with 3 rotating images
- Booking form positioned over the hero (on desktop)
- Room grid filtered by guest count

### Room Details (`/room/:id`)

- Hero banner with room name
- Left column: Room description, image, facilities grid
- Right column: Booking form, price, hotel rules

## Asset Conventions

### Static Assets

All theme assets are served from `/theme/hotel/assets/`:

- Hero images: `/theme/hotel/assets/hero/1.jpg`, `/theme/hotel/assets/hero/2.jpg`, `/theme/hotel/assets/hero/3.jpg`
- Logos: `/theme/hotel/assets/logos/logo-dark.svg`, `/theme/hotel/assets/logos/logo-white.svg`
- Room images: `/theme/hotel/assets/rooms/1.png` through `/theme/hotel/assets/rooms/8.png` (plus `-lg.png` variants)

## Room Filtering

The theme includes a context-based filtering system:

1. User selects number of adults and kids in the booking form
2. Clicks "Check Now" button
3. Rooms are filtered based on `maxPerson` capacity
4. Loading spinner displays for 3 seconds (simulating API call)
5. Filtered results appear in the room grid

## Styling

### Color Scheme

- **Primary**: `#0a0a0a` (black)
- **Accent**: `#a37d4c` (gold)
- **Accent Hover**: `#967142` (darker gold)

### Typography

- **Primary Font**: Gilda Display (serif) - Used for headings
- **Secondary Font**: Barlow (sans-serif) - Used for body text
- **Tertiary Font**: Barlow Condensed (sans-serif) - Used for buttons and nav

### Custom Classes

- `.h2` - Large heading (45px)
- `.h3` - Medium heading (24px)
- `.btn` - Base button style
- `.btn-primary` - Gold accent button
- `.btn-secondary` - Black button (hovers to gold)
- `.btn-lg` - Large button (60px height)
- `.btn-sm` - Small button (48px height)

## Integration with CMS

The theme integrates with the CMS branding system:

- Fetches branding colors from database via `useThemeBranding` hook
- Applies colors as CSS variables: `--brand-primary`, `--brand-accent`, etc.
- Falls back to default hotel colors if no branding is set

## Dependencies

This theme requires the following packages (already in the main project):

- `react-datepicker` - Date picker for check-in/check-out
- `react-icons` - Icons for facilities and UI
- `swiper` - Hero slider carousel
- `@headlessui/react` - Dropdown menus
- `spinners-react` - Loading spinner

## Customization

To customize the theme for a specific hotel:

1. Update `theme.json` with hotel name and description
2. Update `pages.json` SEO metadata
3. Replace images in `assets/` folders
4. Modify room data in `data/rooms.ts`
5. Update hotel rules in `data/constants.ts`
6. Adjust colors via CMS branding settings or in `theme.css`

## Routing

The theme uses CMS routing via the `pageSlug` prop:

- `/theme/hotel` → Homepage
- `/theme/hotel/room/1` → Room 1 details
- `/theme/hotel/room/2` → Room 2 details
- etc.

Internal navigation uses `window.location.href` to work with the CMS routing system.

## Development Notes

- All components are TypeScript (`.tsx`)
- Type definitions in `types.ts`
- Room context manages filtering state
- Scroll-to-top utility on page changes
- Responsive breakpoints: sm (640px), md (768px), lg (960px), xl (1140px)
