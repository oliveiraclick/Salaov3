
import { createClient } from '@supabase/supabase-js';

// Tenta pegar as variáveis de ambiente. 
// No ambiente de desenvolvimento local, crie um arquivo .env com essas chaves.
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

// Cria o cliente apenas se as chaves existirem
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;
