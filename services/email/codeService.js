import supabase from '../../api/v2/supabase.js';

/**
 * Creates a random verification code and stores it in Supabase
 * @param {string|number} user_id - The ID of the user to associate with this code
 * @returns {Promise<number>} The generated verification code
 * @throws {Error} If the code cannot be saved to the database
 */
const createCode = async (user_id) => {
    // Input validation
    if (!user_id) {
        throw new Error('User ID is required');
    }
    
    // Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000);
    
    // Set expiration time (15 minutes from now)
    const expirationTime = new Date(Date.now() + 15 * 60 * 1000);
    
    // Save the code in Supabase
    const { error } = await supabase
        .from('verification_code')
        .insert({ 
            user_id: user_id,
            code: code,
            expires_at: expirationTime,
            used: false,
            created_at: new Date()
        });
    
    if (error) {
        console.error('Database error:', error);
        throw new Error(`Error saving verification code: ${error.message}`);
    }
    
    return code;
}

export { createCode };

const verifyCode = async (user_id, code) => {
    const { data, error } = await supabase
        .from('verification_code')
        .select()
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
    
    if (verificationCode.expires_at < new Date()) {
        throw new Error('Verification code has expired');
    }
    
    // Mark the code as used
    const { error: updateError } = await supabase
        .from('verification_code')
        .update({ used: true })
        .eq('verification_code_id', verificationCode.verification_code_id);
    
    if (updateError) {
        console.error('Database error:', updateError);
        throw new Error(`Error updating verification code: ${updateError.message}`);
    }
    
    return true;
}

export { verifyCode };
