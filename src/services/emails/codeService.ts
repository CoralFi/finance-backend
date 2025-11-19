import supabase from '@/db/supabase';

export const createCode = async (user_id: string | number): Promise<number> => {
  if (!user_id) {
    throw new Error('User ID is required');
  }

  const code = Math.floor(100000 + Math.random() * 900000); // 6 dígitos
  const expirationTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

  const { error } = await supabase
    .from('verification_code')
    .insert({
      user_id,
      code,
      expires_at: expirationTime,
      used: false,
      created_at: new Date(),
    });

  if (error) {
    console.error('Database error:', error);
    throw new Error(`Error saving verification code: ${error.message}`);
  }

  return code;
};

export const createCodeBuss = async (conduit_id: string | number): Promise<number> => {
  if (!conduit_id) {
    throw new Error('conduit ID is required');
  }

  const code = Math.floor(100000 + Math.random() * 900000); // 6 dígitos
  const expirationTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

  const { error } = await supabase
    .from('verification_code')
    .insert({

      code,
      expires_at: expirationTime,
      used: false,
      conduit_id,
      created_at: new Date(),
    });

  if (error) {
    console.error('Database error:', error);
    throw new Error(`Error saving verification code: ${error.message}`);
  }

  return code;
};



export const verifyCode = async (user_id: string | number, code: number): Promise<boolean> => {
  const { data, error } = await supabase
    .from('verification_code')
    .select('*')
    .eq('user_id', user_id)
    .eq('code', code)
    .eq('used', false)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Database error:', error);
    throw new Error(`Error verifying verification code: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error('Invalid verification code!');
  }

  const verificationCode = data[0];

  if (new Date(verificationCode.expires_at) < new Date()) {
    throw new Error('Verification code has expired');
  }

  const { error: updateError } = await supabase
    .from('verification_code')
    .update({ used: true })
    .eq('verification_code_id', verificationCode.verification_code_id);

  if (updateError) {
    console.error('Database error:', updateError);
    throw new Error(`Error updating verification code: ${updateError.message}`);
  }

  return true;
};

/**
 * Verifica un código de verificación usando customer_id y la función de base de datos
 * @param customer_id - UUID del customer
 * @param code - Código de verificación de 6 dígitos
 * @returns true si el código es válido
 */
export const verifyCodeDB = async (customer_id: string, code: number): Promise<boolean> => {
  if (!customer_id) {
    throw new Error('Customer ID is required');
  }

  if (!code) {
    throw new Error('Code is required');
  }

  // Primero verificar si el código existe y es válido (sin marcarlo como usado)
  const { data: checkData, error: checkError } = await supabase
    .rpc('verify_code', {
      p_customer_id: customer_id,
      p_code: code,
      p_used: null
    });

  if (checkError) {
    console.error('Database error:', checkError);
    throw new Error(`Error verifying verification code: ${checkError.message}`);
  }

  if (!checkData || checkData.length === 0) {
    throw new Error('Invalid or expired verification code!');
  }

  // Si el código es válido, marcarlo como usado
  const { data: updateData, error: updateError } = await supabase
    .rpc('verify_code', {
      p_customer_id: customer_id,
      p_code: code,
      p_used: true
    });

  if (updateError) {
    console.error('Database error:', updateError);
    throw new Error(`Error updating verification code: ${updateError.message}`);
  }

  return true;
};

export const verifyCodeBusiness = async (conduit_id: string, code: number): Promise<boolean> => {
  if (!conduit_id) throw new Error('Conduit ID is required');
  if (!code) throw new Error('Code is required');

  // Paso 1: Buscar código válido
  const { data: checkData, error: checkError } = await supabase
    .from('verification_code')
    .select('*')
    .eq('conduit_id', conduit_id)
    .eq('code', code)
    .eq('used', false)
    .gte('expires_at', new Date().toISOString()) // si tu tabla tiene expiración
    .limit(1);

  if (checkError) {
    console.error("Database error:", checkError);
    throw new Error(`Error verifying code: ${checkError.message}`);
  }
  console.log(checkData[0].verification_code_id)
  if (!checkData || checkData.length === 0) {
    throw new Error('Invalid or expired verification code!');
  }

  // Paso 2: Marcar como usado
  const { error: updateError } = await supabase
    .from('verification_code')
    .update({ used: true })
    .eq('verification_code_id', checkData[0].verification_code_id);

  if (updateError) {
    console.error("Database error:", updateError);
    throw new Error(`Error marking code as used: ${updateError.message}`);
  }

  return true;
};
