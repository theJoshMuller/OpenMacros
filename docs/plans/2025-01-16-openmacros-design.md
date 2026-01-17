# OpenMacros Design Document

**Date:** 2025-01-16
**Version:** 1.0 - MVP Design
**Status:** Approved

## Project Overview

OpenMacros is a bilingual (English/Spanish), offline-first PWA for tracking calories and macros. MVP includes manual food entry and AI-powered photo analysis, with architecture designed for future device sync.

### Primary Target User
Health-conscious individuals on a body recomposition journey, including those seeking visible abs. The app must be accessible to all users (fitness enthusiasts, general health-conscious, people with medical needs) through different profiles.

---

## Overall Architecture

### Tech Stack

**Frontend:** React with Next.js (for PWA support and optimization)

**UI:** Tailwind CSS + shadcn/ui components (copied into codebase)

**PWA:** next-pwa plugin for manifest, service worker, offline caching

**Storage:** IndexedDB via Dexie.js (wrapper that makes IndexedDB pleasant)

**AI Integration:** Direct fetch to OpenRouter API for food image analysis

**Internationalization:** i18next with JSON translation files

**State Management:** React Context + local state (no heavy state library needed yet)

### App Structure

- PWA architecture with service worker caching assets and app shell
- Client-side only (no backend needed for MVP - all data in IndexedDB)
- Offline-first: app loads immediately, syncs OpenRouter API calls when online
- Pre-sync architecture: Data models designed with unique IDs and timestamps, ready for conflict resolution

### Key Architectural Decisions for Future Sync

- Every data record includes: `id`, `deviceId`, `createdAt`, `updatedAt`
- Write operations use UUIDs, not database auto-increment
- Designed for eventual merge strategies (last-write-wins, or conflict resolution UI)
- P2P sync library can be added later without refactoring data model

---

## Data Model & IndexedDB Schema

### Foods Store
```typescript
{
  id: string (UUID),
  name: {en: string, es: string},
  description: {en: string, es: string},
  brand?: string,
  servingSize: number,
  servingUnit: {en: string, es: string},
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
  fiber?: number,
  sugar?: number,
  deviceId: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Meals Store
```typescript
{
  id: string (UUID),
  name: {en: string, es: string},
  foods: Array<{foodId: string, quantity: number}>,
  totalCalories: number,
  totalProtein: number,
  totalCarbs: number,
  totalFat: number,
  deviceId: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Daily Logs Store
```typescript
{
  id: string (UUID),
  date: string (YYYY-MM-DD),
  entries: Array<{
    type: 'food' | 'meal',
    itemId: string, // Reference to food or meal
    quantity: number,
    calories: number,
    protein: number,
    carbs: number,
    fat: number,
    timestamp: timestamp
  }>,
  totalCalories: number,
  totalProtein: number,
  totalCarbs: number,
  totalFat: number,
  deviceId: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### User Profile Store
```typescript
{
  id: string (singleton),
  name: string,
  targetCalories: number,
  targetProtein: number,
  targetCarbs: number,
  targetFat: number,
  openRouterApiKey?: string,
  selectedModel?: string,
  modelTag?: string,
  language: 'en' | 'es',
  deviceId: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Design Notes

- Denormalized nutrition data in `dailyLogs` entries for performance and historical accuracy
- Translations stored as objects `{en, es}` for bilingual support
- `deviceId` tracks which device created the record (for future sync conflicts)
- Timestamps enable conflict resolution strategies later

---

## Key Features & User Flows

### Onboarding Flow

1. Welcome screen with language selection (English/Spanish)
2. Personal info collection: name, age, weight, height, gender
3. Activity level selection (sedentary, lightly active, etc.)
4. Goal selection (lose weight, maintain, gain muscle)
5. TDEE calculation display with auto-generated macro targets
6. Editable targets screen (user can override calculated values)
7. Optional: OpenRouter API key (can add later)
8. Complete - navigate to dashboard

### Daily Tracking Dashboard

- **Header**: Date selector (today/yesterday/datepicker), progress rings showing calories/macros
- **Quick Add**: Large buttons for "Add Food", "Add Meal", "Scan Food Photo"
- **Today's Entries**: Chronological list of foods/meals with time stamps
- **Summary**: Totals vs targets with visual indicators (green/orange/red)

### Add Food Flow

1. Search bar with autocomplete from food library
2. Filter by recent foods, favorites (if MVP time allows)
3. Select food → show serving size input
4. Adjust quantity with slider or number input
5. Real-time nutrition calculation updates
6. Confirm → adds to daily log with timestamp

### AI Food Analysis Flow

1. Tap "Scan Food Photo" → opens camera
2. Take photo or select from gallery
3. Show preview with "Analyze" button
4. Call OpenRouter API with food image + optimized prompt
5. Display AI result: food name, description, serving size, nutrition
6. User confirms or edits values
7. "Save to library" option (adds to personal foods)
8. Add to daily log with timestamp

### Settings Screen

- Personal info (editable, triggers TDEE recalc)
- Target calories/macros (editable)
- Recalculate TDEE button
- OpenRouter API key input
- Model selection dropdown with custom model + tag input
- Language toggle (English/Spanish)
- Export/Import data (for MVP: manual JSON export, future: sync)

---

## Error Handling & Edge Cases

### Network & API Errors

- **OpenRouter API failure**: Show friendly error "Couldn't analyze photo", offer retry or manual entry. Cache last successful API response in IndexedDB
- **Offline mode**: Gracefully degrade - app works fully for manual entry, show "offline" indicator, queue API calls for retry when back online
- **API quota exceeded**: Inform user, suggest checking API key or try again later
- **Invalid API key**: Validate on save, show error immediately, prevent API calls until fixed

### Data Validation

- **Required fields**: All inputs validated on blur/submit (name can't be empty, calories must be positive)
- **Range validation**: Serving size (1-10000g), reasonable calorie ranges (50-5000 per entry)
- **Type safety**: Ensure all nutrition values are numbers, timestamps are valid
- **Duplicate prevention**: Prevent adding identical entries within same minute

### User Input Edge Cases

- **No photo selected**: Camera view with "Cancel" option
- **Unrecognized food by AI**: Show "Couldn't identify this food", offer manual entry as fallback
- **Bad photo quality**: Suggest retake if AI confidence is low (if API provides confidence scores)
- **Deleting entries**: Confirm dialog, removal from daily log updates totals immediately

### Data Integrity

- **Corrupt IndexedDB**: Implement migration strategy, offer "Reset all data" in settings
- **UUID collision**: Generate UUIDs with collision-resistant algorithm, validate on write
- **Orphaned references**: Occasional cleanup job to remove food references from deleted foods

### Performance

- **Large food library**: Implement pagination or virtual scrolling for search results
- **Many daily entries**: Limit displayed entries to last 50, show "Load more" for history
- **Image upload**: Compress photos before sending to API (max 1MB)

---

## Testing Strategy

### Unit Tests (Jest + React Testing Library)

- TDEE calculation logic with various inputs
- Nutrition calculations (food * quantity)
- IndexedDB CRUD operations (via Dexie)
- Translation string retrieval
- UUID generation
- Image compression utilities

### Integration Tests

- Onboarding flow end-to-end
- Add food to daily log
- Manual food entry search and selection
- Edit existing entries
- Update user profile targets
- Language switching (English ↔ Spanish)

### AI/ API Tests

- Mock OpenRouter API responses for successful food analysis
- Test error scenarios (API down, invalid key, quota exceeded)
- Validate prompt structure (though actual AI quality requires manual verification)

### Visual Regression Tests

- Key screens (dashboard, food entry, settings) in both languages
- Responsive layouts (mobile portrait, landscape, tablet)
- Dark mode support (if included in MVP)

### Manual Testing Checklist

- Full onboarding flow creates valid user profile
- Daily totals update correctly when adding foods
- AI photo analysis works with real photos
- Offline mode allows manual entry
- Language switching updates all visible text
- Export/import data preserves all records
- App reloads maintain state

### Edge Case Testing

- Extreme values (very high/low calorie foods)
- Long food names and descriptions
- Rapid successive food additions
- Browser refresh mid-entry
- IndexedDB quota exceeded

---

## Component Structure & Organization

### Core Layout Components

- `AppShell`: Root layout with PWA shell, theme provider, i18n provider
- `Navbar`: Header with app title, settings button, date navigation
- `TabBar`: Bottom navigation (Dashboard, Foods, Meals, Settings) - if MVP time allows

### Feature Components (organized by feature)

#### /Onboarding
- `OnboardingWizard`: Multi-step form container
- `PersonalInfoForm`: Age, weight, height, gender inputs
- `ActivityLevelSelector`: Grid of activity options
- `GoalSelector`: Weight loss/maintain/gain options
- `TargetReviewScreen`: Show calculated TDEE, allow editing
- `ApiKeySetup`: Optional OpenRouter key input

#### /Dashboard
- `Dashboard`: Main view with progress rings, quick actions
- `DateSelector`: Navigation between days
- `ProgressRings`: Visual calorie/macro progress
- `DaySummary`: Totals vs targets with status indicators
- `EntryList`: Chronological food/meal entries
- `EntryItem`: Single entry with time, food info, delete button

#### /FoodEntry
- `FoodSearch`: Autocomplete search bar
- `FoodSearchResults`: List of matching foods
- `ServingSizeInput`: Quantity with slider/number input
- `NutritionPreview`: Real-time calculation display
- `ConfirmDialog`: Confirmation before adding

#### /AIAnalysis
- `CameraView`: Camera capture or gallery select
- `PhotoPreview`: Show captured photo with retake option
- `AnalyzeButton`: Trigger OpenRouter API call
- `AnalysisResult`: Display AI-extracted food data
- `EditAnalysisResult`: Form to correct AI values
- `SaveToLibrary`: Toggle for adding to personal foods

#### /Settings
- `SettingsScreen`: Main settings navigation
- `ProfileEditor`: Edit personal info and targets
- `TdeeRecalculator`: Recalculate with current data
- `ApiKeyInput`: Update OpenRouter credentials
- `ModelSelector`: Choose AI model with custom option
- `LanguageSelector`: Toggle English/Spanish
- `DataManagement`: Export/import, reset data

### Reusable Components

- `Card`, `Button`, `Input`, `Select` (from shadcn/ui)
- `Modal`, `Dialog` overlays
- `Toast` notifications
- `LoadingSpinner`
- `EmptyState` (no foods, no entries, etc.)

---

## Implementation Phases & Milestones

### Phase 1: Project Setup & Foundation (Week 1)

- Initialize Next.js project with TypeScript, Tailwind, PWA
- Install and configure shadcn/ui
- Set up i18next with English/Spanish translations
- Configure Dexie.js for IndexedDB with data models
- Set up Jest + React Testing Library
- Create basic app shell and routing

### Phase 2: Onboarding & User Profile (Week 2)

- Implement all onboarding screens and wizard
- TDEE calculation logic (Mifflin-St Jeor equation)
- User profile CRUD operations
- Basic settings screen
- Target display and editing

### Phase 3: Food Library & Manual Entry (Week 3)

- Seed food database with common foods (from USDA API)
- Food search with autocomplete
- Manual food entry flow
- Daily log CRUD operations
- Dashboard with progress rings and entry list

### Phase 4: AI Food Analysis (Week 4)

- Camera component and photo capture
- Image compression (max 1MB)
- OpenRouter API integration with optimized prompt
- AI result display and editing
- Save analysis to library functionality

### Phase 5: Polish & Testing (Week 5)

- Comprehensive testing (unit, integration, manual)
- Bug fixes and UX refinements
- Performance optimization
- Accessibility audit
- PWA manifest and service worker configuration

### Phase 6: Documentation & Handoff (Week 6)

- Architecture documentation for future sync implementation
- Developer guide for contributing food library
- Deployment instructions
- Known issues and technical debt notes

Each phase ends with a working increment that can be tested.

---

## Project File Structure

```
OpenMacros/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout with providers
│   │   ├── page.tsx                  # Landing/onboarding check
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Dashboard route
│   │   ├── foods/
│   │   │   ├── page.tsx              # Food library view
│   │   │   └── add/
│   │   │       └── page.tsx          # Add food form
│   │   ├── ai-analysis/
│   │   │   └── page.tsx              # Camera & AI analysis
│   │   └── settings/
│   │       └── page.tsx              # Settings screens
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── onboarding/               # Onboarding components
│   │   ├── dashboard/                # Dashboard components
│   │   ├── food-entry/               # Food entry components
│   │   ├── ai-analysis/              # AI/ camera components
│   │   └── settings/                 # Settings components
│   │
│   ├── lib/
│   │   ├── db/                       # Dexie database setup
│   │   │   ├── schema.ts             # IndexedDB schema
│   │   │   ├── foods.ts              # Food store operations
│   │   │   ├── meals.ts              # Meal store operations
│   │   │   ├── dailyLogs.ts          # Daily log operations
│   │   │   └── userProfile.ts        # User profile operations
│   │   ├── utils/
│   │   │   ├── tdee.ts               # TDEE calculations
│   │   │   ├── nutrition.ts          # Nutrition calculations
│   │   │   ├── image.ts              # Image compression
│   │   │   └── uuid.ts               # UUID generation
│   │   ├── api/
│   │   │   └── openRouter.ts         # OpenRouter API client
│   │   └── prompts/
│   │       └── foodAnalysis.ts       # AI prompt templates
│   │
│   ├── hooks/
│   │   ├── useUserProfile.ts         # User profile state
│   │   ├── useDailyLog.ts            # Daily log operations
│   │   └── useFoodSearch.ts          # Food search with debouncing
│   │
│   ├── types/
│   │   ├── db.ts                     # Database types
│   │   ├── api.ts                    # API response types
│   │   └── user.ts                   # User profile types
│   │
│   ├── locales/
│   │   ├── en/
│   │   │   └── common.json           # English translations
│   │   └── es/
│   │       └── common.json           # Spanish translations
│   │
│   ├── styles/
│   │   └── globals.css               # Tailwind directives
│   │
│   └── __tests__/
│       ├── lib/
│       │   ├── tdee.test.ts
│       │   └── image.test.ts
│       └── components/
│           └── onboarding.test.tsx
│
├── docs/
│   ├── plans/
│   │   └── 2025-01-16-openmacros-design.md  # This design doc
│   └── architecture/
│       └── sync-preparation.md            # Future sync architecture
│
├── public/
│   ├── icons/                          # App icons for PWA
│   └── manifest.json                    # PWA manifest
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── jest.config.js
└── pwa.config.js                       # next-pwa configuration
```

---

## Future Considerations

### Device Sync (Post-MVP)

- QR code pairing with PIN confirmation
- P2P sync library (PeerJS or similar)
- Conflict resolution strategies
- Real-time bi-directional sync

### Food Library Expansion

- Community contribution system
- Automatic updates from open APIs
- Custom meal templates
- Recipe management

### Enhanced AI Features

- Multi-food recognition in single photo
- Meal suggestions based on goals
- Nutritional recommendations
- Progress insights and analysis

---

## Success Criteria

MVP is successful when:

1. User can complete full onboarding and have accurate TDEE/macro targets
2. Manual food entry is fast and intuitive (< 30 seconds per entry)
3. AI photo recognition works with reasonable accuracy for common foods
4. Daily tracking provides clear visual feedback on progress
5. App works offline for manual entry
6. Full English/Spanish language support
7. PWA installable and functions as mobile app
8. All tests pass with good coverage
9. Comprehensive documentation for future developers

---

**Document Status:** Complete - Ready for implementation
**Next Steps:** Begin Phase 1 (Project Setup & Foundation)
