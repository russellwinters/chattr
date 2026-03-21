# LanguageSelector Component - Technical Specification

## Executive Summary

This document specifies the design and implementation plan for the `LanguageSelector` component, which will enable users to select target languages for translation in the chattr application. Currently, the application only supports translation from English to Spanish. This component will allow users to choose from all 31 languages supported by the DeepL API.

## Problem Statement

The current implementation hardcodes the target language as Spanish (`"es"`) in `/src/pages/api/translate.ts:25`. Users cannot change the target language, limiting the application's utility for multilingual communication.

## Success Criteria

1. Users can select a target translation language from a dropdown/selector UI
2. The selected language persists throughout the session
3. Translation API uses the selected language instead of hardcoded Spanish
4. Component integrates seamlessly with existing UI design patterns
5. Component is accessible and follows React/Next.js best practices

## Component Architecture

### Component Location
**Path**: `/src/components/LanguageSelector/`

**Structure**:
```
src/components/LanguageSelector/
├── LanguageSelector.tsx       # Main component logic
├── LanguageSelector.module.scss  # Component styles
└── index.ts                   # Export barrel
```

### Component Interface

```typescript
type LanguageOption = {
  code: string;           // DeepL language code (e.g., 'es', 'fr', 'de')
  name: string;           // Display name (e.g., 'Spanish', 'French', 'German')
  nativeName?: string;    // Optional native name (e.g., 'Español', 'Français')
};

type LanguageSelectorProps = {
  value: string;                    // Currently selected language code
  onChange: (languageCode: string) => void;  // Callback when language changes
  classNames?: string;              // Optional additional CSS classes
  disabled?: boolean;               // Optional disabled state
};
```

## Supported Languages

Based on DeepL API's `TargetLanguageCode` type, the component will support:

**Common Languages** (available to all):
- Bulgarian (bg), Czech (cs), Danish (da), German (de), Greek (el), Spanish (es), Estonian (et), Finnish (fi), French (fr), Hungarian (hu), Indonesian (id), Italian (it), Japanese (ja), Korean (ko), Lithuanian (lt), Latvian (lv), Norwegian Bokmål (nb), Dutch (nl), Polish (pl), Romanian (ro), Russian (ru), Slovak (sk), Slovenian (sl), Swedish (sv), Turkish (tr), Ukrainian (uk), Chinese (zh)

**Regional Variants**:
- English (British): en-GB
- English (American): en-US
- Portuguese (Brazilian): pt-BR
- Portuguese (European): pt-PT

**Total**: 31 target languages

## State Management Strategy

### Approach: React Context + Local Storage

**Rationale**: 
- Application is currently small and doesn't use external state management
- Context API provides sufficient state sharing between components
- Local storage ensures persistence across page refreshes
- Follows existing patterns in the codebase (event-driven communication)

### Implementation Plan

**1. Create Language Context** (`/src/contexts/LanguageContext.tsx`):
```typescript
type LanguageContextType = {
  targetLanguage: string;
  setTargetLanguage: (code: string) => void;
  availableLanguages: LanguageOption[];
};
```

**2. Context Provider Placement**:
- Wrap `<Component>` in `/src/pages/_app.tsx` with `<LanguageProvider>`
- This makes language state available throughout the application

**3. Local Storage Key**: 
- Key: `chattr_target_language`
- Default value: `'es'` (Spanish, maintaining backward compatibility)

### Alternative Considered: Event-Driven (Like Current Messages)

**Pros**: Matches existing pattern for message handling
**Cons**: 
- More complex for simple state sharing
- Doesn't provide easy access to current language state
- Would require additional event listeners in multiple components

**Decision**: Context API is more appropriate for shared application state vs. event bus for transient messages.

## DOM Placement & Layout

### Primary Location: Top of Application

**Placement**: At the top of the page in `/src/pages/index.tsx`, above `MessageList`

**Layout Justification**:
- Persistent visibility regardless of scroll position
- Standard UI pattern for application-level settings
- Establishes translation target context before viewing messages
- Doesn't interfere with chat flow or message viewing
- Clear separation between configuration and content

### Visual Design

**Layout Structure**:
```
┌─────────────────────────────────────┐
│  Translate to: [Language Dropdown]  │  ← New LanguageSelector (at top)
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│                                     │
│         Message List Area           │
│                                     │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  [Input Field]         [Submit Btn] │  ← Existing ChatInput
└─────────────────────────────────────┘
```

### Grid System Update

Update `/src/styles/Home.module.scss`:
```scss
.main {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr 56px;  // Changed from "1fr 56px"
  // LanguageSelector + MessageList + ChatInput
  // ... existing styles
  
  .languageSelector {
    padding: 12px 0;
  }
}
```

### Alternative Placement Considered: Between MessageList and ChatInput

**Pros**: Near input functionality, visual connection to translation
**Cons**: 
- Separated from message input area
- Less immediate visual connection to chat functionality

**Decision**: Place at top of application for persistent visibility and standard UI pattern; configuration before content.

## Styling Approach

### Design System Consistency

**Follow Existing Patterns**:
1. Use SCSS modules (consistent with Button, Input, ChatInput)
2. Match existing color scheme and typography
3. Use `classnames` package for conditional styling
4. Maintain responsive design principles

### Component Styles (`LanguageSelector.module.scss`)

```scss
.container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  
  .label {
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    color: inherit;  // Inherit from global theme
  }
  
  .select {
    width: 100%;
    height: 40px;
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    background-color: white;
    cursor: pointer;
    
    &:hover {
      border-color: #999;
    }
    
    &:focus {
      outline: none;
      border-color: #0070f3;  // Match Next.js blue
      box-shadow: 0 0 0 3px rgba(0, 112, 243, 0.1);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  
  // Tablet and desktop
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    
    .select {
      flex: 1;
      max-width: 300px;
    }
  }
}
```

### Responsive Considerations

**Breakpoints**:
- **Mobile** (default): Stack label above dropdown vertically, both full width
- **Tablet/Desktop** (≥768px): Horizontal layout with label and dropdown side-by-side

**Mobile-First Approach**:
The styles are defined mobile-first, with full mobile styles as the base. Then, a `min-width` media query at 768px updates the layout for larger screens. This follows modern CSS best practices and ensures the most critical styles (mobile) are loaded first.

## Data Flow

### 1. Component Initialization
```
App Start → LanguageProvider reads localStorage → Sets default 'es' or saved value
```

### 2. User Selects Language
```
User clicks dropdown → Selects language → onChange callback fires
→ LanguageContext updates → localStorage saves → All consumers re-render
```

### 3. Translation Flow
```
User types message → Submits → ChatInput reads targetLanguage from context
→ Sends to /api/translate with targetLanguage → API returns translation
→ Message displayed in MessageList
```

## API Modifications

### Update `/src/pages/api/translate.ts`

**Current** (line 25):
```typescript
const result = await translator.translateText(data.text, null, "es");
```

**New**:
```typescript
// Validate and default the target language
const VALID_LANGUAGES = new Set([
  'bg', 'cs', 'da', 'de', 'el', 'es', 'et', 'fi', 'fr', 
  'hu', 'id', 'it', 'ja', 'ko', 'lt', 'lv', 'nb', 'nl', 
  'pl', 'ro', 'ru', 'sk', 'sl', 'sv', 'tr', 'uk', 'zh',
  'en-GB', 'en-US', 'pt-BR', 'pt-PT'
]);

const targetLang = data.targetLanguage && VALID_LANGUAGES.has(data.targetLanguage) 
  ? data.targetLanguage 
  : "es";  // Default to Spanish if invalid or missing

const result = await translator.translateText(data.text, null, targetLang);
```

**Request Body Type**:
```typescript
// For better type safety, define a union type of valid language codes
type TargetLanguageCode = 
  | 'bg' | 'cs' | 'da' | 'de' | 'el' | 'es' | 'et' | 'fi' | 'fr' 
  | 'hu' | 'id' | 'it' | 'ja' | 'ko' | 'lt' | 'lv' | 'nb' | 'nl' 
  | 'pl' | 'ro' | 'ru' | 'sk' | 'sl' | 'sv' | 'tr' | 'uk' | 'zh'
  | 'en-GB' | 'en-US' | 'pt-BR' | 'pt-PT';

type TranslateRequest = {
  text: string;
  targetLanguage?: TargetLanguageCode;  // Union type for type safety
};
```

### API Request Update in ChatInput

**Current**: Only sends `text`
**New**: Include `targetLanguage` from context

```typescript
const { targetLanguage } = useLanguage();  // From context

const response = await fetch("/api/translate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    text: value,
    targetLanguage: targetLanguage,  // Add this
  }),
});
```

## Component Integration Flow

### Step-by-Step Implementation Order

1. **Create Language Constants** (`/src/utils/languages.ts`)
   - Define `SUPPORTED_LANGUAGES` array with all 31 languages
   - Include language codes, display names, and optional native names
   - Export as constant for reuse

2. **Create Language Context** (`/src/contexts/LanguageContext.tsx`)
   - Define context type and provider
   - Implement localStorage persistence
   - Set default value to 'es'

3. **Update App Wrapper** (`/src/pages/_app.tsx`)
   - Import and wrap application with `<LanguageProvider>`

4. **Create LanguageSelector Component** (`/src/components/LanguageSelector/`)
   - Build UI with dropdown
   - Connect to context
   - Add styling
   - Export from barrel file

5. **Update Components Index** (`/src/components/index.ts`)
   - Add LanguageSelector export

6. **Update Main Page** (`/src/pages/index.tsx`)
   - Import LanguageSelector
   - Add to layout at the top, above MessageList
   - Update grid styles

7. **Update ChatInput** (`/src/components/ChatInput/ChatInput.tsx`)
   - Import and use language context
   - Pass targetLanguage to API

8. **Update API** (`/src/pages/api/translate.ts`)
   - Accept targetLanguage parameter
   - Use it in translation call

9. **Update Styles** (`/src/styles/Home.module.scss`)
   - Adjust grid layout for three rows

## Accessibility Considerations

### ARIA Attributes
- Use `<label>` element with proper `htmlFor` attribute
- Add `aria-label` to select: "Select target translation language"
- Ensure keyboard navigation works (native select element)

### Screen Reader Support
- Label clearly describes purpose: "Translate to:"
- Selected value is announced on change
- Disabled state is properly communicated

### Keyboard Navigation
- Tab to focus
- Arrow keys to navigate options
- Enter/Space to open dropdown
- Escape to close without selecting

## Testing Strategy

### Manual Testing Checklist
1. Default language is Spanish on first load
2. Selected language persists after page refresh
3. Changing language updates translations immediately
4. All 31 languages are available in dropdown
5. Dropdown is accessible via keyboard
6. Component styling matches existing design
7. Mobile responsive behavior works correctly
8. API correctly receives and uses selected language

### Edge Cases to Test
1. Invalid language code in localStorage → Falls back to Spanish
2. Translation API error → Error message displayed (existing behavior)
3. Very long language names → Dropdown width handles gracefully
4. Rapid language switching → Debounce not needed (state is synchronous)

## Performance Considerations

### Optimization Strategies
1. **Memoization**: Use `useMemo` for language options array
2. **Lazy Loading**: Context only loads once, no additional API calls
3. **Local Storage**: Read once on mount, write on change only
4. **No Network Overhead**: Language list is static, no API fetch needed

### Bundle Size Impact
- Estimated addition: ~5KB (component + context + constants)
- No new dependencies required
- Acceptable for feature value

## Security Considerations

### Input Validation
- Validate language code against allowed list in API
- Prevent injection attacks by using TypeScript enums/unions
- Sanitize localStorage reads

### API Layer Validation
```typescript
const VALID_LANGUAGES = new Set([
  'bg', 'cs', 'da', 'de', 'el', 'es', 'et', 'fi', 'fr', 
  'hu', 'id', 'it', 'ja', 'ko', 'lt', 'lv', 'nb', 'nl', 
  'pl', 'ro', 'ru', 'sk', 'sl', 'sv', 'tr', 'uk', 'zh',
  'en-GB', 'en-US', 'pt-BR', 'pt-PT'
]);

if (!VALID_LANGUAGES.has(targetLang)) {
  targetLang = 'es';  // Fallback to safe default
}
```

## Migration & Backward Compatibility

### Breaking Changes
**None** - This is a pure feature addition

### Compatibility Strategy
1. Default language remains Spanish ('es')
2. API accepts but doesn't require targetLanguage parameter
3. Existing messages/sessions continue to work
4. No database migrations needed (client-side only)

## Future Enhancements (Out of Scope)

### Phase 2 Considerations
1. **Source Language Detection**: Allow specifying source language (currently auto-detect)
2. **Language Favorites**: Star frequently used languages for quick access
3. **Recent Languages**: Show recently used languages at top of list
4. **Language Search**: Add search/filter for large language list
5. **Multiple Simultaneous Translations**: Translate to multiple languages at once
6. **Language Flag Icons**: Visual indicators alongside language names
7. **RTL Language Support**: Proper styling for Arabic, Hebrew, etc.
8. **Formality Options**: Some languages support formal/informal (German, French, etc.)

### Integration with Future Features
- User accounts: Save language preference to user profile
- Chat rooms: Per-room language settings
- Analytics: Track most popular language pairs

## Dependencies

### New Dependencies
**None** - All required functionality available in existing dependencies

### Existing Dependencies Used
- `react` - Component logic, context, hooks
- `classnames` - Conditional styling
- `deepl-node` - Already imported, no changes needed
- `sass` - SCSS modules

## Risk Assessment

### Low Risk Items ✅
- Component is isolated and testable
- No breaking changes to existing code
- State management is simple and proven
- UI pattern is standard across web applications

### Medium Risk Items ⚠️
- localStorage availability (handle gracefully if blocked)
- Context performance with many re-renders (mitigated by selective subscription)
- API rate limiting with language switching (unlikely but monitor)

### Mitigation Strategies
1. Wrap localStorage in try-catch with fallback to memory-only state
2. Use React.memo for LanguageSelector to prevent unnecessary re-renders
3. Add loading states during translation to prevent duplicate requests

## Implementation Timeline

### Estimated Effort
**Total**: 4-6 hours for complete implementation and testing

**Breakdown**:
1. Language constants and types: 30 minutes
2. Context and provider: 1 hour
3. LanguageSelector component: 1.5 hours
4. Integration with existing components: 1 hour
5. Styling and responsive design: 1 hour
6. Testing and bug fixes: 1-2 hours

### Phases
- **Phase 1** (Core): Constants, Context, Component UI
- **Phase 2** (Integration): Connect to ChatInput and API
- **Phase 3** (Polish): Styling, accessibility, testing

## Open Questions

1. **Should source language also be selectable?**
   - Current: Auto-detection
   - Recommendation: Keep auto-detect for MVP, add later if requested

2. **Should we show native language names?**
   - Example: "Spanish (Español)", "French (Français)"
   - Recommendation: Yes, improves UX for multilingual users

3. **Should language persist across devices?**
   - Current plan: localStorage (device-specific)
   - Future: Could sync via user account/cloud storage

4. **Should we limit the language list based on API tier?**
   - Current: All 31 languages available
   - Recommendation: Show all, handle API errors gracefully if user has limited tier

## Documentation Updates Required

### README.md
- Add section explaining language selection feature
- Include screenshot of language selector
- Document localStorage key for advanced users

### Code Comments
- JSDoc comments for LanguageContext
- Inline comments explaining language code mappings
- Document API parameter in translate.ts

## Success Metrics

### Quantitative
- Component renders in <50ms
- No console errors or warnings
- All 31 languages selectable and functional
- localStorage writes in <10ms
- 100% keyboard accessibility

### Qualitative
- Component "feels" integrated with existing design
- Language selection is intuitive and discoverable
- Error states are handled gracefully
- Code is maintainable and well-documented

## Conclusion

The LanguageSelector component is a straightforward, high-value feature addition that will significantly enhance the chattr application's utility. The implementation follows established patterns in the codebase, requires no new dependencies, and poses minimal risk to existing functionality.

The use of React Context for state management provides a scalable foundation for future enhancements while keeping the initial implementation simple and focused. The component's placement above the chat input ensures visibility and maintains logical flow within the user interface.

## Appendix A: Complete Language List

| Code | Language Name | Native Name |
|------|---------------|-------------|
| bg | Bulgarian | Български |
| cs | Czech | Čeština |
| da | Danish | Dansk |
| de | German | Deutsch |
| el | Greek | Ελληνικά |
| es | Spanish | Español |
| et | Estonian | Eesti |
| fi | Finnish | Suomi |
| fr | French | Français |
| hu | Hungarian | Magyar |
| id | Indonesian | Bahasa Indonesia |
| it | Italian | Italiano |
| ja | Japanese | 日本語 |
| ko | Korean | 한국어 |
| lt | Lithuanian | Lietuvių |
| lv | Latvian | Latviešu |
| nb | Norwegian (Bokmål) | Norsk bokmål |
| nl | Dutch | Nederlands |
| pl | Polish | Polski |
| ro | Romanian | Română |
| ru | Russian | Русский |
| sk | Slovak | Slovenčina |
| sl | Slovenian | Slovenščina |
| sv | Swedish | Svenska |
| tr | Turkish | Türkçe |
| uk | Ukrainian | Українська |
| zh | Chinese | 中文 |
| en-GB | English (British) | English (UK) |
| en-US | English (American) | English (US) |
| pt-BR | Portuguese (Brazilian) | Português (Brasil) |
| pt-PT | Portuguese (European) | Português (Portugal) |

## Appendix B: File Checklist

**Files to Create**:
- [ ] `/src/utils/languages.ts` - Language constants
- [ ] `/src/contexts/LanguageContext.tsx` - Context provider
- [ ] `/src/components/LanguageSelector/LanguageSelector.tsx` - Component
- [ ] `/src/components/LanguageSelector/LanguageSelector.module.scss` - Styles
- [ ] `/src/components/LanguageSelector/index.ts` - Barrel export

**Files to Modify**:
- [ ] `/src/pages/_app.tsx` - Add context provider
- [ ] `/src/pages/index.tsx` - Add component to layout
- [ ] `/src/pages/api/translate.ts` - Accept language parameter
- [ ] `/src/components/ChatInput/ChatInput.tsx` - Use context, pass language to API
- [ ] `/src/components/index.ts` - Export LanguageSelector
- [ ] `/src/styles/Home.module.scss` - Update grid layout

**Total**: 5 new files, 6 modified files

---

**Document Version**: 1.0  
**Last Updated**: 2025-12-03  
**Author**: Plannermanz Agent  
**Status**: Ready for Implementation
