# File Structure Consolidation Plan

## Current Issues
- Duplicate authentication logic across multiple files
- Scattered database operations
- Inconsistent file organization

## Recommended Structure

### 1. Authentication Consolidation
**Current:**
- `db/auth.ts` - Auth functions
- `lib/auth.ts` - getUser function  
- `lib/auth/session.ts` - Session utilities
- `lib/auth/wallet.ts` - Wallet utilities

**Recommended:**
- `lib/auth/index.ts` - Main auth exports
- `lib/auth/client.ts` - Client-side auth functions
- `lib/auth/server.ts` - Server-side auth functions
- `lib/auth/session.ts` - Session management
- `lib/auth/wallet.ts` - Wallet integration

### 2. Database Operations Consolidation
**Current:**
- `db/queries.ts` - All queries
- `db/mutations.ts` - All mutations
- `db/cached-queries.ts` - Cached queries
- `db/storage.ts` - Storage operations

**Recommended:**
- `lib/database/index.ts` - Main database exports
- `lib/database/queries.ts` - All database queries
- `lib/database/mutations.ts` - All database mutations
- `lib/database/cache.ts` - Caching logic
- `lib/database/storage.ts` - Storage operations

### 3. Supabase Configuration (Keep As-Is)
**Current (CORRECT):**
- `supabase/` - Migrations and config
- `lib/supabase/` - Client configurations

## Migration Steps

1. **Create new structure:**
   ```bash
   mkdir -p lib/database
   mkdir -p lib/auth
   ```

2. **Move and consolidate files:**
   - Move `db/*` to `lib/database/`
   - Consolidate auth files into `lib/auth/`
   - Update all imports

3. **Update imports across the codebase**

4. **Remove old `db/` folder**

## Benefits
- Clear separation of concerns
- Consistent file organization
- Easier maintenance
- Better TypeScript support
- Follows Next.js best practices
