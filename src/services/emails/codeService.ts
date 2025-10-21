import supabase from '../../db/supabase';
 
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
