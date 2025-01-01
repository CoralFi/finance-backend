import BrevoClient from '../../services/email/BrevoClient.js';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {

    res.setHeader('Access-Control-Allow-Origin', '*'); // TODO: cambiar por la del front
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  } 

  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { email } = req.body;

  // Buscar al usuario en Supabase
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !data) return res.status(404).send('User not found');

  // Generar un token de restablecimiento
  const token = crypto.randomBytes(16).toString('hex');

  // Actualizar el token en Supabase
  const { error: updateError } = await supabase
    .from('usuarios')
    .update({ reset_token: token })
    .eq('email', email);

  if (updateError) return res.status(500).send('Error updating reset token');

  // Generar el enlace de restablecimiento
  const resetLink = `${process.env.BASE_URL}/api/email/reset-password.html?token=${token}&email=${email}`;
  const brevoClient = new BrevoClient();

  try {
    const emailData = {
      to: [{ email }],
      subject: 'Resetea tu contraseña',
      htmlContent: `<p>Haz click <a href="${resetLink}">aquí</a> para resetear tu contraseña. Si no solicitaste resetear tu contraseña ignora este mensaje</p>`,
      sender: { email: 'contact@coralfinance.io', name: 'Coral Finance' },
    }

    await brevoClient.sendTransacEmail(emailData);

    res.status(200).send('Password reset email sent');
  } catch (error) {
    res.status(500).send('Error sending email');
  }
}
