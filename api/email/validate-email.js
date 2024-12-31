import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  const { token, email } = req.query;

  // Buscar el usuario en Supabase
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email)
    .eq('token', token)
    .single();

  if (error || !data) return res.status(400).send('Invalid token or email');

  // Actualizar el estado de validación
  const { error: updateError } = await supabase
    .from('usuarios')
    .update({ validated: true, token: null })
    .eq('email', email);

  if (updateError) return res.status(500).send('Error updating validation status');

  res.send('Email validated successfully');
}
