import SupabaseClient from "../../database/client.js";

class otpService {
    constructor() {
        this.supabase = new SupabaseClient().getClient();
    }

  async saveOtp(email, otp) {
    const { data, error } = await this.supabase
        .from('otps')
        .insert({ email: email, otp: otp });

    if (error) {
        console.error('Error al guardar OTP:', error);
        throw error;
    }
    return data;
  }

  async validateOtp(email, otp) {
    console.log("OTP SERVICE")

    const { data, error } = await this.supabase
        .from('otps')
        .select('otp')
        .eq('email', email)
        .single();

    console.log("DATA:", data)

    if (error) {
        console.error('Error al validar OTP:', error);
        throw error;
    }

    if (data && data.otp === otp) {
        // Eliminar OTP después de validarlo
        console.log("DELETE OTP")
        const { error: deleteError } = await this.supabase
            .from('otps')
            .delete()
            .eq('email', email);

        if (deleteError) {
            console.error('Error al eliminar OTP:', deleteError);
            throw deleteError;
        }

        return { message: 'OTP válido. Transacción confirmada' };
    }

    return { error: 'OTP incorrecto o expirado' };
  }
}

export default otpService;