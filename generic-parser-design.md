# Generic Resume Parser Design

## Current Limitations
1. **Rigid 3-line structure assumption**
2. **State machine approach too specific**
3. **Limited section header detection**

## Improved Generic Approach

### 1. Multi-Pattern Detection
Instead of assuming one format, detect multiple common patterns:

```typescript
// Pattern 1: Your format (Job Title -> Date -> Company)
// Pattern 2: Company first (Company -> Job Title -> Date)
// Pattern 3: Inline format (Job Title at Company (Date Range))
// Pattern 4: Mixed formats within same resume
```

### 2. Flexible Section Detection
```typescript
const experienceKeywords = [
  'experience', 'employment', 'work history', 'professional experience',
  'work experience', 'career history', 'professional background',
  'employment history', 'work', 'career'
];
```

### 3. Smart Field Assignment
Instead of rigid state machine, use scoring system:

```typescript
interface LineAnalysis {
  isJobTitle: number;      // 0-1 confidence score
  isCompany: number;       // 0-1 confidence score  
  isDate: number;          // 0-1 confidence score
  isDescription: number;   // 0-1 confidence score
}

function analyzeLine(line: string): LineAnalysis {
  // Score based on multiple indicators:
  // - Job title keywords
  // - Company indicators (Inc, LLC, Corp, etc.)
  // - Date patterns
  // - Bullet point symbols
  // - Line length and structure
}
```

### 4. Context-Aware Parsing
```typescript
// Look at surrounding lines for context
// If previous line was a job title, next line is likely date or company
// Use machine learning-like confidence scoring
```

### 5. Fallback Strategies
```typescript
// If structured parsing fails, fall back to:
// 1. Keyword extraction
// 2. Named entity recognition
// 3. Pattern matching with lower confidence
```

## Implementation Strategy

### Phase 1: Multi-Format Support
- Add detection for 3-4 most common resume formats
- Keep your current logic as "Pattern 1"
- Add alternative patterns

### Phase 2: Smart Detection
- Implement confidence scoring
- Add format auto-detection
- Improve field assignment logic

### Phase 3: ML Enhancement
- Train on diverse resume samples
- Add NLP for better text understanding
- Implement adaptive learning

## Recommended Immediate Improvements

1. **Add format detection:**
   ```typescript
   enum ResumeFormat {
     TITLE_DATE_COMPANY,    // Your current format
     COMPANY_TITLE_DATE,    // Alternative format
     INLINE_FORMAT,         // "Engineer at Google (2020-2023)"
     MIXED_FORMAT          // Multiple formats in same resume
   }
   ```

2. **Flexible parsing:**
   ```typescript
   // Try multiple parsing strategies and pick best result
   const strategies = [
     parseWithCurrentLogic,
     parseWithAlternativeFormat,
     parseWithKeywordExtraction
   ];
   ```

3. **Better validation:**
   ```typescript
   // Validate parsed results and retry with different strategy if needed
   function validateExperience(exp: WorkExperience): boolean {
     return exp.company && exp.position && 
            (exp.startDate || exp.description?.length > 0);
   }
   ```
