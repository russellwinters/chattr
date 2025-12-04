# LanguageSelector Component - Quick Reference

## Overview
Add a dropdown component to allow users to select target translation language (currently hardcoded to Spanish).

## Key Decisions

### Architecture
- **State Management**: React Context API + localStorage
- **Component Type**: Controlled dropdown (native `<select>`)
- **Styling**: SCSS modules (matching existing pattern)

### Placement
- **Location**: Top of the application, above MessageList
- **Layout**: Horizontal label + dropdown on desktop, stacked on mobile
- **Grid Update**: Change from 2 rows to 3 rows (auto 1fr 56px)

### Languages
- **Total**: 31 DeepL-supported target languages
- **Default**: Spanish ('es')
- **Persistence**: localStorage key `chattr_target_language`
- **Display**: English name + native name (e.g., "Spanish (Español)")

## Implementation Checklist

### New Files (5)
1. `/src/utils/languages.ts` - Constants for all 31 languages
2. `/src/contexts/LanguageContext.tsx` - Context provider with localStorage
3. `/src/components/LanguageSelector/LanguageSelector.tsx` - Component
4. `/src/components/LanguageSelector/LanguageSelector.module.scss` - Styles
5. `/src/components/LanguageSelector/index.ts` - Barrel export

### Modified Files (6)
1. `/src/pages/_app.tsx` - Wrap with `<LanguageProvider>`
2. `/src/pages/index.tsx` - Add `<LanguageSelector>` at top of layout
3. `/src/pages/api/translate.ts` - Accept `targetLanguage` param
4. `/src/components/ChatInput/ChatInput.tsx` - Use context, send language to API
5. `/src/components/index.ts` - Export LanguageSelector
6. `/src/styles/Home.module.scss` - Update grid to 3 rows (auto 1fr 56px)

## Data Flow

```
User selects language 
  → LanguageContext updates
  → localStorage saves
  → ChatInput reads from context
  → Sends to API with targetLanguage
  → DeepL translates
  → Result displayed
```

## Key Code Snippets

### Context Usage
```typescript
const { targetLanguage, setTargetLanguage } = useLanguage();
```

### API Call
```typescript
fetch("/api/translate", {
  method: "POST",
  body: JSON.stringify({ 
    text: value, 
    targetLanguage: targetLanguage 
  })
})
```

### Component Props
```typescript
<LanguageSelector 
  value={targetLanguage}
  onChange={setTargetLanguage}
/>
```

## Testing Focus Areas
1. ✅ Default language = Spanish
2. ✅ Language persists after refresh
3. ✅ All 31 languages work
4. ✅ Keyboard accessible
5. ✅ Matches design system
6. ✅ Mobile responsive

## Risk Mitigation
- **localStorage blocked**: Fallback to memory-only state
- **Invalid language code**: Validate in API, fallback to 'es'
- **API errors**: Use existing error handling

## Accessibility
- Use `<label htmlFor>` for screen readers
- Native `<select>` ensures keyboard navigation
- ARIA labels on select element
- Focus states with visible outline

## Performance
- No new dependencies
- ~5KB bundle size addition
- Static language list (no API calls)
- Memoized language array

## Future Enhancements (Out of Scope)
- Source language selection
- Language favorites/recents
- Search/filter for languages
- Flag icons
- Formality options

## Timeline
**Estimated**: 4-6 hours total
- Core implementation: 3 hours
- Integration: 1 hour  
- Testing & polish: 2 hours

---

For full details, see [language-selector-plan.md](./language-selector-plan.md)
