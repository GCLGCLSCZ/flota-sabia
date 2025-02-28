
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Usar valores por defecto si no están definidas las variables de entorno
// Esto evitará el error "supabaseUrl is required"
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseClient = null;

// Solo crear el cliente si tenemos las credenciales
if (supabaseUrl && supabaseAnonKey) {
  supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
}

export const supabase = supabaseClient;
