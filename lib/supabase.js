import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kvuiprqcyyetxcfyspyc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2dWlwcnFjeXlldHhjZnlzcHljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjUwODUsImV4cCI6MjA2NDY0MTA4NX0.PvnjBJsUGbW5XR_LtQUc3whH_5fNm0FWOIILDSP-i1s'

export const supabase = createClient(supabaseUrl, supabaseKey)