#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bwelkcqqzkiiaxrkoslb.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3ZWxrY3FxemtpaWF4cmtvc2xiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTI3MDYzMCwiZXhwIjoyMDg0ODQ2NjMwfQ.nqWAZh_GrwSzfYeos20Cqn_kwwJMdNcWtyAeyraBWqQ';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const { data, error } = await supabase
  .from('businesses')
  .select('id, name, slug, brand_primary_color, brand_secondary_color, logo_url')
  .limit(5);

if (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

console.log('📊 Businesses with branding:\n');
data.forEach((biz) => {
  console.log(`ID: ${biz.id}`);
  console.log(`Name: ${biz.name}`);
  console.log(`Slug: ${biz.slug}`);
  console.log(`Primary Color: ${biz.brand_primary_color || 'not set'}`);
  console.log(`Secondary Color: ${biz.brand_secondary_color || 'not set'}`);
  console.log(`Logo URL: ${biz.logo_url || 'not set'}`);
  console.log('─'.repeat(50));
});
