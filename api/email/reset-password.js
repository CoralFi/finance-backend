import bcrypt from "bcrypt";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://finance-front-beryl.vercel.app'); // TODO: cambiar por la del front
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
    } 

  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { token, email } = req.query;

  const { newPassword } = req.body;
  
  // Encriptar la contraseña
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Buscar al usuario y validar el token
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email)
    .eq('reset_token', token)
    .single();

  if (error || !data) return res.status(400).send('Invalid token or email');

  // Actualizar la contraseña y eliminar el token
  const { error: updateError } = await supabase
    .from('usuarios')
    .update({ password: hashedPassword, reset_token: null })
    .eq('email', email);

  if (updateError) return res.status(500).send('Error updating password');

  res.send('Password reset successfully');
}
