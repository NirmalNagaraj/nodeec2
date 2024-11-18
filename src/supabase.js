import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vltjtxnswjezzknirhtb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsdGp0eG5zd2plenprbmlyaHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5MzkwNzYsImV4cCI6MjA0NzUxNTA3Nn0.hZCRR81gnQusH6iNuAGddPyK9lBEmRQE8QrV3hr6-_8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
