const { 
    createClient
} = require('@supabase/supabase-js');
const {
    SUPABASE_PUBLIC_URL,
    SUPABASE_ROLE_KEY,
} = require('../config/consts');

const supabaseAdmin = createClient(
    'https://vlydfmttptpiobhokprr.supabase.co' || '',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZseWRmbXR0cHRwaW9iaG9rcHJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4OTk5MjQ3MywiZXhwIjoyMDA1NTY4NDczfQ.Uo5V8tAf7oEWztJQAa8V1wyYDLq9sBMSxDrvaA86fCA' || ''
);

module.exports = {
    supabaseAdmin
}