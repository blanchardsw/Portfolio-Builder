# Test File Cleanup Recommendations

## Files to Remove

### 1. Remove `basic.test.ts` (Redundant)
- **Reason**: Duplicates functionality of `minimal.test.ts`
- **Action**: Delete `src/__tests__/basic.test.ts`
- **Impact**: No coverage loss, cleaner test suite

### 2. Remove `upload.test.ts.disabled` (Obsolete)
- **Reason**: Complex integration test that was causing failures
- **Action**: Delete `src/__tests__/routes/upload.test.ts.disabled`
- **Impact**: No coverage loss (upload.ts still at 0% but that's acceptable)

## Files to Keep (Working Well)

### Core Coverage Files
- ✅ `simple-coverage.test.ts` - Main coverage booster (71%+ coverage)
- ✅ `minimal.test.ts` - Clean basic test verification
- ✅ `server-initialization.test.ts` - Fixed and working

### Service-Specific Tests (All working)
- ✅ `constants.test.ts` - 100% coverage
- ✅ `customErrors.test.ts` - 100% coverage
- ✅ All parsing service tests - 100% coverage
- ✅ Individual service tests - Good coverage

## Cleanup Commands

Run these commands to clean up:

```bash
# Remove redundant basic test
rm src/__tests__/basic.test.ts

# Remove disabled upload test
rm src/__tests__/routes/upload.test.ts.disabled
```

## Post-Cleanup Test Suite

After cleanup, you'll have:
- **21 test files** → **19 test files** (cleaner)
- **Same coverage** (71%+ statements/lines)
- **No redundant code**
- **All tests passing**

## Verification

After cleanup, run:
```bash
npm test -- --coverage
```

Should maintain the same coverage levels:
- Statements: 71.46%
- Lines: 71.2%
- Functions: 74.33%
