# Branding Settings Enhancement: Country & Language Fields

## Overview
Added comprehensive Country and Language selection fields to the Branding Settings tab with searchable dropdowns for better user experience.

## New Features

### 1. Country Selection
- **Comprehensive List**: 50+ countries including major markets
- **Searchable Dropdown**: Type to filter countries quickly
- **Default Value**: Singapore (matching GO SG's location)
- **Icon**: Globe icon with brand teal color
- **Responsive**: Works on mobile and desktop

### 2. Language Selection  
- **Extensive Coverage**: 50+ languages including major world languages
- **Searchable Interface**: Fast filtering with search input
- **Default Value**: English
- **Icon**: Languages icon with brand purple color
- **Alphabetical Sorting**: Both lists are automatically sorted

### 3. Timezone Selection
- **Global Coverage**: 70+ timezones covering all major regions
- **Offset Display**: Shows UTC offset for each timezone (e.g., +08:00, -05:00)
- **Dual Search**: Search by timezone name or offset
- **Default Value**: Singapore Standard Time (SGT)
- **Icon**: Clock icon with brand gold color
- **Comprehensive List**: Includes standard time, daylight saving time, and regional variations

## Technical Implementation

### Components Added
- `SearchableDropdown`: Reusable component for both country and language selection
- Modal-based interface using Radix UI Dialog
- Search functionality with real-time filtering
- Check mark indicator for selected items

### UI/UX Features
- **Search Placeholder**: "Search country..." / "Search language..." / "Search timezone..."
- **Responsive Grid**: Three columns on large screens, two on medium, stacked on mobile
- **Visual Feedback**: Selected items show check marks
- **Timezone Offsets**: UTC offsets displayed below timezone names
- **Dual Search**: Search timezones by name or offset (e.g., "+08" or "Singapore")
- **Empty State**: "No [item] found" when search yields no results
- **Auto-close**: Modal closes automatically after selection

### Preview Integration
- Country, language, and timezone display in the branding preview section
- Styled with appropriate icons and colors (teal, purple, gold)
- Responsive layout with flex-wrap for mobile devices
- Separated by a subtle border for visual hierarchy

## Countries Included (50+)
- Singapore, United States, United Kingdom, Australia, Canada
- Germany, France, Japan, China, India, Brazil, Mexico
- European countries: Italy, Spain, Netherlands, Sweden, Norway, etc.
- Asian markets: Thailand, Malaysia, Indonesia, Philippines, Vietnam, etc.
- And many more...

## Languages Supported (50+)
- Major world languages: English, Chinese, Spanish, Hindi, Arabic
- European languages: German, French, Italian, Portuguese, Russian
- Asian languages: Japanese, Korean, Vietnamese, Thai, Malay
- Regional languages: Bengali, Telugu, Tamil, Gujarati, etc.

## Timezones Included (70+)
- **UTC/GMT**: Coordinated Universal Time, Greenwich Mean Time
- **Americas**: EST, CST, MST, PST (+ daylight variants), AST, HST, AKST
- **Europe**: CET, EET, BST, WET (+ summer variants)
- **Asia-Pacific**: SGT, JST, KST, HKT, IST, ICT, AEST, NZST
- **Middle East/Africa**: GST, MSK, CAT, EAT, SAST
- **Regional Variants**: Including half-hour and 45-minute offsets (IST +05:30, NPT +05:45)

## Code Structure

### State Management
```typescript
const [brandingData, setBrandingData] = useState({
  // ... existing fields
  country: 'Singapore',
  language: 'English',
  timezone: 'SGT - Singapore Standard Time'
});

// Search states for filtering
const [countrySearch, setCountrySearch] = useState('');
const [languageSearch, setLanguageSearch] = useState('');
const [timezoneSearch, setTimezoneSearch] = useState('');
const [countryOpen, setCountryOpen] = useState(false);
const [languageOpen, setLanguageOpen] = useState(false);
const [timezoneOpen, setTimezoneOpen] = useState(false);
```

### Filtering Logic
```typescript
const filteredCountries = countries.filter(country =>
  country.name.toLowerCase().includes(countrySearch.toLowerCase())
);

const filteredLanguages = languages.filter(language =>
  language.name.toLowerCase().includes(languageSearch.toLowerCase())
);

const filteredTimezones = timezones.filter(timezone =>
  timezone.name.toLowerCase().includes(timezoneSearch.toLowerCase()) ||
  timezone.offset.includes(timezoneSearch)
);
```

## Benefits
1. **Better Localization**: Helps identify target markets, languages, and time zones
2. **SEO Enhancement**: Country/language data can be used for geo-targeting
3. **Business Operations**: Timezone selection enables proper scheduling and time-based features
4. **User Experience**: Fast, searchable interface with visual feedback and offset display
5. **Global Reach**: Comprehensive coverage for international business operations
6. **Scalability**: Easy to add more countries/languages/timezones in the future
7. **Consistency**: Matches GO SG's professional branding standards

## Future Enhancements
- Integration with backend API for saving/loading settings
- Country flag icons for visual identification
- Language code display for technical reference
- Auto-timezone suggestion based on selected country
- Currency selection for e-commerce features
- Real-time clock display showing current time in selected timezone
- Daylight saving time automatic adjustments
- Business hours configuration based on timezone

## Files Modified
- `sparti-cms/components/admin/BrandingSettingsPage.tsx`: Main implementation
- `sparti-cms/components/admin/MediaModal.tsx`: New media selection component
- Added comprehensive country, language, and timezone data (170+ total options)
- Implemented enhanced SearchableDropdown component with offset display
- Enhanced preview section with country/language/timezone display
- **NEW**: Restructured to single-column layout for better UX
- **NEW**: Integrated MediaModal for logo and favicon selection
- **NEW**: Added upload capability with file validation

## UX/UI Improvements
- **Single Column Layout**: Improved readability and focus
- **Sectioned Organization**: Clear separation of Basic Info, Location & Language, Logo, and Favicon
- **Media Modal Integration**: Professional file selection with upload capability
- **Responsive Design**: Maintains functionality across all screen sizes
- **Visual Hierarchy**: Better spacing and typography for improved user experience

## Media Modal Features
- **Grid/List View**: Toggle between visual grid and detailed list views
- **Search Functionality**: Find media files quickly by name
- **File Upload**: Drag-and-drop or click to upload new files
- **File Validation**: Automatic validation of file types and sizes
- **Progress Tracking**: Real-time upload progress indication
- **Type Filtering**: Show only relevant file types (images for logo, ICO/PNG for favicon)

The implementation follows GO SG's design system with proper color coding:
- **Teal** (Globe icon) for Country
- **Purple** (Languages icon) for Language  
- **Gold** (Clock icon) for Timezone
- **Purple** (Brand color) for MediaModal selection states

All components maintain consistency with existing UI patterns and provide a professional, scalable solution for international business settings with enhanced media management capabilities.
