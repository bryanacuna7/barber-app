#!/usr/bin/env node

/**
 * Apply branding migration using Supabase client
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = 'https://bwelkcqqzkiiaxrkoslb.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3ZWxrY3FxemtpaWF4cmtvc2xiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTI3MDYzMCwiZXhwIjoyMDg0ODQ2NjMwfQ.nqWAZh_GrwSzfYeos20Cqn_kwwJMdNcWtyAeyraBWqQ';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function checkColumns() {
  console.log('🔍 Checking if branding columns exist...');

  const { data, error } = await supabase
    .from('businesses')
    .select('brand_primary_color, brand_secondary_color, logo_url')
    .limit(1);

  if (error) {
    if (error.message.includes('column') && error.message.includes('does not exist')) {
      console.log('❌ Columns missing - migration needed\n');
      return false;
    }
    throw error;
  }

  console.log('✅ Branding columns already exist!\n');
  return true;
}

async function main() {
  try {
    const exists = await checkColumns();

    if (!exists) {
      console.log('📋 Manual action required:');
      console.log('\n1. Go to: https://supabase.com/dashboard/project/bwelkcqqzkiiaxrkoslb');
      console.log('2. Click "SQL Editor" in the left menu');
      console.log('3. Click "New query"');
      console.log('4. Paste the following SQL:\n');

      const migrationSQL = readFileSync(
        join(__dirname, '../supabase/migrations/003_branding.sql'),
        'utf8'
      );

      console.log('─'.repeat(60));
      console.log(migrationSQL);
      console.log('─'.repeat(60));
      console.log('\n5. Click "Run" (or press Cmd/Ctrl + Enter)');
      console.log('6. Re-run this script to verify\n');

      process.exit(1);
    }

    console.log('🎉 All set! The branding feature is ready to use.');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
