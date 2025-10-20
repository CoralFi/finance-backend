import supabase from '../../db/supabase'; 

interface OtpRecord {
  email: string;
  otp: string;
}

export default class OtpService {
  private supabase = supabase; // ✅ sin new, sin constructor

  public async saveOtp(email: string, otp: string): Promise<OtpRecord[]> {
    const { data, error } = await this.supabase
      .from('otps')
      .insert({ email, otp });

    if (error) {
      console.error('Error al guardar OTP:', error);
      throw error;
    }
    if (!data) {
      throw new Error('No se pudo guardar el OTP'); 
    }
    return data;
  }


  public async validateOtp(email: string, otp: string): Promise<{ message: string } | { error: string }> {
    const { data, error } = await this.supabase
      .from('otps')
      .select('otp')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error al validar OTP:', error);
      throw error;
    }

    if (data && data.otp === otp) {
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
