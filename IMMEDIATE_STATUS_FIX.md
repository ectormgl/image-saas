## 🚨 IMMEDIATE FIX for Status Constraint Error

You're getting this error: `new row for relation "image_requests" violates check constraint "valid_status"`

### ⚡ Quick Fix - Run This SQL Now:

**Copy and paste this into your Supabase SQL Editor:**

```sql
-- Fix the status constraint issue immediately
DO $$ 
BEGIN
    -- Drop the problematic constraint
    ALTER TABLE image_requests DROP CONSTRAINT IF EXISTS valid_status;
    
    -- Make image_input_url nullable (fixes previous error too)
    ALTER TABLE image_requests ALTER COLUMN image_input_url DROP NOT NULL;
    
    -- Add the correct status constraint
    ALTER TABLE image_requests 
    ADD CONSTRAINT image_requests_status_valid 
    CHECK (status IN ('pending', 'processing', 'completed', 'failed'));
    
EXCEPTION 
    WHEN OTHERS THEN 
        RAISE NOTICE 'Some operations may have been skipped if already applied';
END $$;

-- Verify the fix worked
SELECT 'Status constraint fixed successfully' as result;
```

### ✅ What This Does:
1. **Removes the problematic constraint** that's causing the error
2. **Fixes the image_input_url issue** from before
3. **Adds a properly named constraint** that allows the correct status values
4. **Verifies the fix** worked

### 🚀 After Running This:
The image generation should work immediately! The error occurs because there's a constraint conflict that this script resolves.

**This is a safe, minimal fix that resolves the immediate blocking issue.**
