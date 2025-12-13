# Character Selection - Planning Summary

## Context

This planning work addresses the GitHub issue requesting comprehensive planning documentation for a new **Character Selection** feature within Conversation Mode. The issue specifies the following requirements:

1. Allow users to have conversations with different character types for more personal and engaging experiences
2. Provide preset characters that add system prompts for their persona
3. Make response conversations similar to the selected persona
4. **Stretch Goal**: Allow users to create custom characters (e.g., "Italian Historian" for conversations about Italian history)

This feature will transform chattr's conversation mode from a single generic AI personality into a diverse, personalized experience with multiple engaging personas.

## What Was Delivered

This planning phase produced four comprehensive documents following the same structure as the language selector and conversation mode documentation:

### 1. Main Planning Document
**File**: `docs/character-selection-plan.md` (~44KB)

**Contents**:
- Executive summary and problem statement
- Complete architecture overview and component specifications
- Five detailed preset character specifications:
  - 👨‍🏫 Friendly Tutor (patient, encouraging)
  - 😊 Casual Friend (informal, conversational)
  - 💼 Business Professional (formal, professional)
  - 🌍 Enthusiastic Travel Guide (energetic, descriptive)
  - 🧙 Wise Mentor (thoughtful, reflective)
- Custom character creation system (stretch goal)
- State management strategy (CharacterContext + localStorage)
- DOM placement and layout options
- Complete API integration plan with code examples
- 6-phase implementation flow with time estimates (MVP)
- 7-phase including stretch goal
- Data flow diagrams
- Complete file structure (8 new files, 7 modified)
- Detailed styling approach with SCSS examples
- Comprehensive accessibility considerations
- Security best practices (prompt injection prevention)
- Testing strategy (manual and automated)
- Performance considerations
- Risk assessment and mitigation strategies
- 2-week implementation timeline (MVP)
- 3-week timeline with stretch goal
- Open questions for stakeholders
- Success metrics (quantitative and qualitative)

### 2. Summary Document
**File**: `docs/character-selection-summary.md` (this file)

**Contents**:
- Planning context and issue requirements
- Overview of deliverables
- Key planning decisions with rationale
- Implementation readiness checklist
- Critical technical choices
- Next steps for stakeholders

### 3. Quick Reference Guide
**File**: `docs/character-selection-quick-reference.md`

**Contents**:
- One-page implementation overview
- Key architectural decisions at a glance
- Implementation checklist (6 phases MVP, 7 with stretch)
- Code snippets for quick lookup
- Data flow overview
- Testing focus areas
- Quick developer onboarding

### 4. Visual Documentation
**File**: `docs/character-selection-diagrams.md`

**Contents**:
- Architecture diagrams (component hierarchy, system flow)
- Component props and interfaces
- UI layout mockups (desktop and mobile)
- Character selector UI options
- Character card designs
- Data flow diagrams
- State management flow
- Sequence diagrams for user interactions
- File structure visualization

## Key Planning Decisions

### 1. Character Roster: Five Diverse Preset Characters

**Decision**: Start with 5 carefully designed preset characters covering common use cases

**Characters Selected**:
1. **Friendly Tutor** 👨‍🏫 - Patient and encouraging, perfect for beginners
2. **Casual Friend** 😊 - Informal and conversational, for everyday practice
3. **Business Professional** 💼 - Formal tone for workplace scenarios
4. **Enthusiastic Travel Guide** 🌍 - Energetic and descriptive for travel contexts
5. **Wise Mentor** 🧙 - Thoughtful and reflective for deeper conversations

**Rationale**:
- Covers spectrum from formal to informal
- Addresses different learning stages (beginner to advanced)
- Provides diverse use cases (education, business, travel, personal growth)
- Each has distinct personality that's easy to understand
- Icons make characters visually identifiable
- Room to expand with more characters in Phase 2

**Alternatives Considered**:
- More characters initially (rejected: too overwhelming)
- Fewer characters (rejected: not enough variety)
- Domain-specific characters (e.g., "Chef", "Doctor") - deferred to Phase 2

### 2. Character Context: Dedicated State Management

**Decision**: Create separate `CharacterContext` following the pattern of `LanguageContext` and `ModeContext`

**Rationale**:
- Consistent with existing architectural patterns
- Simple and maintainable for app's current scale
- localStorage persistence for user preference
- No need for external state management at this stage
- Follows React best practices
- Easy to test and debug

**Storage**:
- localStorage key: `chattr_selected_character`
- Default: `'friendly-tutor'` (most beginner-friendly)
- For custom characters (stretch): `chattr_custom_characters` array

### 3. UI Placement: Conditional Visibility

**Decision**: Show CharacterSelector only when in Conversation Mode

**Placement**: Below mode selector, in header area

**Rationale**:
- Only relevant in conversation mode (not translation mode)
- Reduces visual clutter when not needed
- Logically grouped with conversation settings
- Better mobile experience (less crowded header)
- Clear contextual relationship with conversation mode

**Layout**:
```
Desktop:
┌────────────────────────────────────────────┐
│ Language: Spanish ▼ | [Trans | Conv]      │
│ Character: 👨‍🏫 Friendly Tutor ▼           │
└────────────────────────────────────────────┘

Mobile (stacked):
┌─────────────────────┐
│ Language: Spanish ▼ │
├─────────────────────┤
│ [Translation | Conv]│
├─────────────────────┤
│ Character: 👨‍🏫 ▼    │
└─────────────────────┘
```

### 4. UI Component: Dropdown for MVP

**Decision**: Use simple dropdown selector for MVP

**Options Considered**:
- **Option A: Dropdown** (selected for MVP)
  - Simple select element
  - Shows icon + name
  - Least development effort
  - Mobile-friendly
  - Quick to implement
  
- **Option B: Modal with Grid** (Phase 2)
  - Better UX for showcasing characters
  - More space for descriptions
  - More development time
  - Better for future expansion
  
- **Option C: Inline Expandable**
  - Accordion-style
  - Takes vertical space
  - Less common pattern

**Rationale for Dropdown**:
- Fastest path to MVP validation
- Familiar UI pattern
- Sufficient for 5 characters
- Can upgrade to modal in Phase 2 with better UX
- Maintains simplicity and clean layout

### 5. System Prompt Integration: Character-Specific Prompts

**Decision**: Each character has unique system prompt that defines personality

**Implementation**:
```typescript
// Character definition
{
  id: 'friendly-tutor',
  name: 'Friendly Tutor',
  systemPrompt: 'You are a friendly, patient language tutor...',
  // ... other properties
}

// API integration
const messages = createConversationMessages(
  targetLanguageName,
  userMessage,
  history,
  selectedCharacter.systemPrompt  // Character-specific prompt
);
```

**Rationale**:
- System prompts are proven method for AI personality control
- Character definitions are maintainable and testable
- Easy to iterate on character personalities
- No additional API cost (system messages are minimal tokens)
- Clear separation of concerns (character data vs. conversation logic)

**Prompt Structure**:
- Character personality description
- Tone and style guidelines
- Response length guidance (2-3 sentences)
- Target language awareness
- Conversation engagement tactics

### 6. Custom Characters: Stretch Goal (Phase 2)

**Decision**: Defer custom character creation to stretch goal / Phase 2

**Feature** (when implemented):
- User can create character with name and archetype
- System generates appropriate prompt from inputs
- Example: "Italian Historian" + "Expert in Italian Renaissance"
- Stored in localStorage
- Maximum 10 custom characters per user

**Rationale for Deferring**:
- Validate preset character concept first
- Reduces MVP scope and risk
- Presets sufficient for initial user testing
- Custom characters add complexity:
  - Input validation
  - Prompt injection prevention
  - Storage management
  - UI for character management (edit/delete)
- Can gauge demand from user feedback before investing

**Phase 2 Features**:
- Custom character creation form
- Character management UI
- Prompt generation from user inputs
- Validation and security measures

### 7. API Changes: Minimal, Backward Compatible

**Decision**: Add optional `characterId` parameter to conversation API

**Changes Required**:
```typescript
// Request type (NEW)
type ConversationRequest = {
  userMessage: string;
  targetLanguage: string;
  conversationHistory?: Array<...>;
  characterId?: string;  // NEW - optional
};

// API endpoint modification
const systemPrompt = characterId 
  ? PRESET_CHARACTERS.find(c => c.id === characterId)?.systemPrompt
  : defaultPrompt;
```

**Rationale**:
- Backward compatible (characterId is optional)
- No breaking changes to existing conversation mode
- Minimal code changes to API
- Easy to test and validate
- Graceful fallback to default if characterId invalid

### 8. Default Character: Friendly Tutor

**Decision**: Default to "Friendly Tutor" for new users

**Rationale**:
- Most appropriate for language learners (primary use case)
- Patient and encouraging tone reduces intimidation
- Educational focus aligns with learning goals
- Clear, simple language good for all proficiency levels
- Positive first impression encourages continued use

## Technical Architecture Highlights

### Component Hierarchy
```
App (_app.tsx)
├── LanguageProvider (existing)
│   └── ModeProvider (existing)
│       └── CharacterProvider (NEW)
│           └── Page
│               ├── LanguageSelector (existing)
│               ├── ModeSelector (existing)
│               ├── CharacterSelector (NEW, conditional)
│               ├── MessageList (existing)
│               └── ChatInput (existing, enhanced)
```

### New Components
1. **CharacterSelector**: Dropdown UI for character selection
2. **CharacterContext**: State management for selected character
3. **useCharacter hook**: Access character context

### Enhanced Components
1. **ChatInput**: Pass characterId to conversation API
2. **Conversation API**: Use character-specific system prompts

### New Utils
1. **characters.ts**: Character definitions and helper functions

## Preset Character Specifications

### 1. Friendly Tutor 👨‍🏫
- **Personality**: Patient, encouraging, educational
- **Tone**: Supportive and clear
- **Use Cases**: Beginners, structured learning, building confidence
- **Example**: "That's great! You're really improving. Let me tell you about..."

### 2. Casual Friend 😊
- **Personality**: Relaxed, informal, friendly
- **Tone**: Warm and conversational
- **Use Cases**: Everyday practice, casual chat, building fluency
- **Example**: "Oh cool! I love that too. Have you ever..."

### 3. Business Professional 💼
- **Personality**: Formal, professional, courteous
- **Tone**: Clear and structured
- **Use Cases**: Business language, formal scenarios, professional development
- **Example**: "Thank you for bringing that to my attention. Regarding your question..."

### 4. Enthusiastic Travel Guide 🌍
- **Personality**: Energetic, descriptive, culturally aware
- **Tone**: Excited and vivid
- **Use Cases**: Travel preparation, cultural learning, descriptive practice
- **Example**: "Oh, you absolutely must visit! The architecture there is breathtaking..."

### 5. Wise Mentor 🧙
- **Personality**: Thoughtful, reflective, philosophical
- **Tone**: Measured and contemplative
- **Use Cases**: Deeper conversations, reflection, mature learners
- **Example**: "That's an interesting observation. Have you considered..."

## Implementation Readiness

All planning is complete and implementation can begin immediately. The plan includes:

✅ **Clear architecture** - 3 layers: UI, state, API  
✅ **Detailed component specs** - Props, interfaces, behavior  
✅ **Character definitions** - 5 preset personas with full system prompts  
✅ **6-phase implementation plan** - Ordered steps with time estimates  
✅ **Code examples** - TypeScript, React, API routes, SCSS  
✅ **Visual mockups** - Desktop and mobile layouts  
✅ **Risk mitigation** - Validation, fallbacks, security measures  
✅ **Testing strategy** - Manual checklist, automated tests  
✅ **Success metrics** - Quantitative and qualitative  
✅ **Timeline** - 2 weeks MVP (11-16 hours), 3 weeks with stretch (15-22 hours)  

## Dependencies and Constraints

### No New Dependencies Required
- All functionality uses existing packages:
  - React Context API (state management)
  - localStorage (persistence)
  - OpenAI (AI personality via system prompts)
  - DeepL (translation, unchanged)

### No New Environment Variables
- Uses existing `OPENAI_API_KEY`
- No additional API accounts needed

### No Breaking Changes
- Feature is additive only
- Existing conversation mode continues to work
- Default behavior (no character selected) uses current system prompt
- Backward compatible API changes

### Minimal Risk
- Feature is isolated (doesn't modify core conversation flow)
- Character selection is optional
- Graceful fallbacks for all error cases
- Can be feature-flagged or disabled easily
- In-memory and localStorage only (no backend changes)

## Cost Analysis

### No Additional API Costs
- **OpenAI**: System prompts add minimal tokens (~50-100 tokens per character)
- **Cost Impact**: Negligible (~$0.0001-0.0002 per request)
- **Total Cost**: Effectively same as current conversation mode
- **No DeepL Changes**: Translation flow unchanged

### Development Cost
- **MVP**: 11-16 hours (2 weeks)
- **With Stretch Goal**: 15-22 hours (3 weeks)
- **Low Risk**: Isolated feature, clear requirements

## Timeline and Effort

### Detailed Phase Breakdown

**Phase 1: Character Infrastructure** (2-3 hours)
- Character type definitions and preset characters
- CharacterContext with localStorage persistence
- useCharacter hook
- Provider setup

**Phase 2: Character Selector UI** (2-3 hours)
- CharacterSelector component (dropdown)
- Styling (SCSS)
- Integration with context
- Conditional rendering

**Phase 3: API Integration** (2-3 hours)
- Update conversation API
- Character prompt interpolation
- Testing each character

**Phase 4: ChatInput Enhancement** (1-2 hours)
- Pass characterId to API
- Test character context

**Phase 5: Polish & Testing** (2-3 hours)
- Test all characters
- Responsive design
- Accessibility audit

**Phase 6: Documentation** (1 hour)
- README updates
- Character documentation

### Total MVP Time: 11-16 hours (2 weeks as sprint)

### Stretch Goal: Custom Characters (Phase 7)
**Phase 7: Custom Character Creation** (4-6 hours)
- Custom character modal
- Form with validation
- Character management (edit/delete)
- Storage and security

### Total With Stretch: 15-22 hours (3 weeks as sprint)

## Risk Assessment

### Risk Matrix

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Character prompts don't produce distinct personalities | Low | Medium | Thorough testing and iteration on prompts |
| User confusion with multiple options | Low | Low | Clear descriptions, good defaults, help text |
| Custom character prompt injection (stretch) | Medium | Medium | Input validation, sanitization, length limits |
| Performance degradation | Very Low | Low | System prompts add minimal tokens |
| Breaking existing features | Very Low | High | Comprehensive testing, backward compatible |

### Overall Risk Level: **Low**

**Why Low Risk**:
- Additive feature (doesn't modify core functionality)
- Proven system prompt pattern for AI personalities
- Isolated components and state management
- Can be feature-flagged or disabled
- No backend changes or new dependencies
- Extensive testing planned

## Next Steps

### For Stakeholders / Decision Makers

1. **Review Planning Documents**
   - Read this summary
   - Review character-selection-plan.md for full details
   - Check diagrams in character-selection-diagrams.md

2. **Address Open Questions** (from main planning doc)
   - Approve preset character roster (5 characters)
   - Decide: Custom characters in MVP or Phase 2?
   - Confirm: Character selector visible only in conversation mode?
   - Approve: Dropdown UI for MVP, upgrade to modal in Phase 2?
   - Decide: Character persistence scope (global vs. per-language)

3. **Approve for Implementation**
   - Confirm technical approach
   - Allocate development time (2 weeks MVP, 3 weeks with stretch)
   - Prioritize Phase 2 features

### For Developers

1. **Review Implementation Plan**
   - Read character-selection-quick-reference.md
   - Review character-selection-plan.md for detailed specs
   - Understand preset character personalities

2. **Follow Implementation Order**
   - Start with Phase 1 (Character infrastructure)
   - Progress through phases sequentially
   - Test thoroughly after each phase

3. **Reference Documentation**
   - Use quick reference for day-to-day development
   - Refer to main plan for detailed specifications
   - Check diagrams for visual understanding

### For QA / Testers

1. **Review Testing Strategy** (in main planning doc)
   - Manual testing checklist
   - Character personality validation
   - Edge cases and error conditions

2. **Prepare Test Scenarios**
   - Test conversations with each character
   - Verify personality distinctiveness
   - Test character switching
   - Test persistence across sessions

3. **Accessibility Testing**
   - Keyboard navigation
   - Screen reader compatibility
   - Focus indicators
   - Color contrast

## Open Questions for Stakeholders

Before implementation begins, please provide guidance on:

### 1. Character Roster Approval
**Question**: Are the 5 proposed preset characters appropriate?

**Proposed**:
- Friendly Tutor, Casual Friend, Business Professional, Travel Guide, Wise Mentor

**Alternatives**: 
- Child-Friendly Teacher, News Reporter, Comedian, Storyteller

**Recommendation**: Start with proposed 5, expand based on feedback

### 2. Custom Characters Priority
**Question**: Should custom character creation be part of MVP or Phase 2?

**Options**:
- Include in MVP (adds 4-6 hours, validates full vision)
- Phase 2 (lower risk, faster MVP, validate presets first)
- Premium feature only

**Recommendation**: Phase 2 - validate preset concept first

### 3. Character Selector UI
**Question**: Dropdown for MVP, or invest in modal with grid?

**Options**:
- Dropdown (simple, fast, good for MVP)
- Modal with grid (better UX, more effort, better for showcase)

**Recommendation**: Dropdown for MVP, modal in Phase 2

### 4. Character Visibility
**Question**: Where should character selector appear?

**Options**:
- Always visible (next to language/mode)
- Only in conversation mode (recommended)
- In settings menu

**Recommendation**: Only in conversation mode (conditional)

### 5. Default Character
**Question**: Which character should be default?

**Proposed**: Friendly Tutor (most beginner-friendly)

**Alternatives**: Casual Friend (more natural for some users)

**Recommendation**: Friendly Tutor (educational focus)

## Success Criteria

### MVP Launch Criteria

**Functional Requirements** ✓
- [ ] Character selector visible in conversation mode
- [ ] Can select from 5 preset characters
- [ ] Selected character persists across sessions
- [ ] Character personality reflected in AI responses
- [ ] Characters work with all supported languages
- [ ] Character switching mid-conversation works
- [ ] Default character is Friendly Tutor

**Technical Requirements** ✓
- [ ] No performance degradation (response time < 3 seconds)
- [ ] No breaking changes to existing features
- [ ] Character state management works correctly
- [ ] localStorage persistence reliable
- [ ] API accepts and uses characterId

**Quality Requirements** ✓
- [ ] Character personalities are distinct and appropriate
- [ ] Accessible (keyboard navigation, screen readers)
- [ ] Responsive (mobile and desktop)
- [ ] Character descriptions clear and helpful
- [ ] UI intuitive (no documentation needed to understand)

### Post-Launch Success Metrics

**Adoption** (30 days)
- % of users who try different characters
- Most popular character personas
- Average character switches per session
- Retention difference for character users

**Quality**
- User satisfaction with character personalities
- Character personality consistency
- User feedback on character descriptions

**Engagement**
- Conversation length with different characters
- Return usage of specific characters
- Custom character creation rate (if stretch goal implemented)

## Conclusion

The Character Selection feature adds meaningful personalization to chattr's conversation mode, transforming it from a generic AI into a diverse cast of engaging personas. This planning work delivers:

1. **Comprehensive technical specification** covering all aspects of the feature
2. **Five well-designed preset characters** with distinct personalities
3. **Clear implementation roadmap** with 6 phases and time estimates
4. **Informed design choices** with detailed rationale
5. **Risk mitigation strategies** including fallbacks and validation
6. **Visual documentation** for UI/UX understanding
7. **Testing and quality assurance** guidelines
8. **Stretch goal specification** for custom character creation

### Why This Plan Works

✅ **Follows existing patterns**: Reuses context approach from Language/Mode selectors  
✅ **Minimal risk**: Additive feature with graceful fallbacks  
✅ **Clear value**: Personalized, engaging language practice  
✅ **No additional cost**: Uses existing OpenAI integration  
✅ **Future-proof**: Extensible architecture for custom characters  
✅ **User-focused**: Diverse personas for different learning styles  
✅ **Quick validation**: MVP in 2 weeks, stretch in 3 weeks  

### Implementation Confidence: **High**

All architectural decisions are documented with rationale, code examples are provided for key components, and alternatives are considered. The feature can be implemented independently without disrupting existing functionality.

The planning follows the same thorough approach as the language selector and conversation mode features, ensuring consistent quality and documentation standards across the project.

---

**Planning Completed**: 2025-12-13  
**Planning Agent**: Plannermanz  
**Status**: ✅ Ready for Stakeholder Review and Development  
**Next Step**: Stakeholder approval and developer assignment  
**Estimated Implementation (MVP)**: 2 weeks / 11-16 dev hours  
**Estimated Implementation (with Stretch)**: 3 weeks / 15-22 dev hours
