# OpenMacros

An open-source, multilingual (English & Spanish), AI-enabled, offline-first, macro & calorie tracker PWA with a beautiful modern UI.

## Features

- **Multilingual**: Full English and Spanish support
- **Offline-First**: Works without internet connection
- **AI-Powered**: Food photo recognition via OpenRouter API
- **Progressive Web App (PWA)**: Installable on mobile devices
- **Smart Tracking**: 
  - TDEE calculation (Mifflin-St Jeor equation)
  - Macro and calorie goal setting
  - Daily food entry with search
  - Visual progress tracking
- **Coming Soon**: Device sync via QR code pairing

## Tech Stack

- **Frontend**: React + Next.js 15
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: IndexedDB (via Dexie.js)
- **Internationalization**: i18next
- **AI Integration**: OpenRouter API
- **Testing**: Jest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

## Project Status

### Completed Phases

- ✅ **Phase 1**: Project Setup & Foundation
- ✅ **Phase 2**: Onboarding & User Profile
- ✅ **Phase 3**: Food Library & Manual Entry

### In Progress

- ⏳ **Phase 4**: AI Food Analysis
- ⏳ **Phase 5**: Polish & Testing
- ⏳ **Phase 6**: Documentation & Handoff

## Features by Phase

### Phase 1: Foundation
- Next.js with TypeScript and Tailwind CSS
- PWA configuration with offline support
- i18next bilingual setup
- Dexie.js IndexedDB schema
- Utility functions (TDEE, nutrition, UUID, image compression)

### Phase 2: Onboarding
- Multi-step wizard with validation
- Personal info collection (age, weight, height, gender)
- Activity level selection (5 levels)
- Goal selection (lose/maintain/gain)
- Target calculation and editing
- Optional OpenRouter API key setup
- User profile CRUD operations
- Basic settings screen

### Phase 3: Food & Manual Entry
- Food database with 20 common foods (bilingual)
- Food search with autocomplete
- Manual food entry with serving size adjustment
- Daily log CRUD operations
- Dashboard with progress rings and entries list

## Roadmap

### Phase 4: AI Food Analysis
- Camera component and photo capture
- Image compression (max 1MB)
- OpenRouter API integration (default: z-ai/glm-4.6v:floor)
- AI result display and editing
- Save analyzed foods to library

### Phase 5: Polish & Testing
- Comprehensive testing (unit, integration, manual)
- Bug fixes and UX refinements
- Performance optimization
- Accessibility audit

### Phase 6: Documentation
- Sync architecture documentation
- Developer guide for food library contributions
- Deployment instructions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Dexie.js](https://dexie.org/)
- [i18next](https://www.i18next.com/)
