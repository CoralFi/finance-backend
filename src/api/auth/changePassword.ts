import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import supabase from '@/db/supabase';
import ResendService from '@/services/emails/resend';

// Rate limiting storage - TODO: implementar Redis en un futuro
interface RateLimitData {
  count: number;
  lastAttempt: number;
}

const attemptTracker = new Map<string, RateLimitData>();

/**
 * Verifica si el usuario ha excedido el límite de intentos de cambio de contraseña
 * @param customer_id - UUID del customer
 * @returns Objeto con allowed (boolean) y remainingTime (number en ms)
 */
function checkRateLimit(customer_id: string): { allowed: boolean; remainingTime: number } {
  const key = `password_change_${customer_id}`;
  const now = Date.now();
  const oneHour = 60 * 60 * 1000; // 1 hora

  if (!attemptTracker.has(key)) {
    attemptTracker.set(key, { count: 0, lastAttempt: now });
    return { allowed: true, remainingTime: 0 };
  }

  const data = attemptTracker.get(key)!;

  // Reset counter si ha pasado más de 1 hora
  if (now - data.lastAttempt > oneHour) {
    attemptTracker.set(key, { count: 0, lastAttempt: now });
    return { allowed: true, remainingTime: 0 };
  }

  // Verificar si excede el límite (3 intentos por hora)
  if (data.count >= 3) {
    const remainingTime = oneHour - (now - data.lastAttempt);
    return { allowed: false, remainingTime };
  }

  return { allowed: true, remainingTime: 0 };
}

/**
 * Registra un intento de cambio de contraseña
 * @param customer_id - UUID del customer
 * @param success - Si el intento fue exitoso
 */
function recordAttempt(customer_id: string, success: boolean = false): void {
  const key = `password_change_${customer_id}`;
  const now = Date.now();

  if (!attemptTracker.has(key)) {
    attemptTracker.set(key, { count: 1, lastAttempt: now });
  } else {
    const data = attemptTracker.get(key)!;
    if (success) {
      // Reset counter en caso de éxito
      attemptTracker.set(key, { count: 0, lastAttempt: now });
    } else {
      // Incrementar contador en caso de fallo
      attemptTracker.set(key, { count: data.count + 1, lastAttempt: now });
    }
  }
}

/**
 * Controlador para cambiar la contraseña de un usuario
 */
export const changePasswordController = async (req: Request, res: Response): Promise<Response> => {
  const { customer_id, currentPassword, newPassword } = req.body as {
    customer_id: string;
    currentPassword: string;
    newPassword: string;
  };

  const resendService = new ResendService();

  // Logging de seguridad
  console.log(`🔐 Intento de cambio de contraseña para customer_id: ${customer_id} - ${new Date().toISOString()}`);

  // Verificar rate limiting
  const rateLimitCheck = checkRateLimit(customer_id);
  if (!rateLimitCheck.allowed) {
    const remainingMinutes = Math.ceil(rateLimitCheck.remainingTime / (1000 * 60));
    console.log(`🚫 Rate limit excedido para ${customer_id}. Tiempo restante: ${remainingMinutes} minutos`);
    return res.status(429).json({
      success: false,
      message: `Demasiados intentos fallidos. Intenta nuevamente en ${remainingMinutes} minutos.`,
    });
  }

  // Validar campos requeridos
  if (!customer_id || !currentPassword || !newPassword) {
    recordAttempt(customer_id, false);
    return res.status(400).json({
      success: false,
      message: 'customer_id, contraseña actual y nueva contraseña son obligatorios.',
    });
  }

  // Validar longitud de nueva contraseña
  if (newPassword.length < 6) {
    recordAttempt(customer_id, false);
    return res.status(400).json({
      success: false,
      message: 'La nueva contraseña debe tener al menos 6 caracteres.',
    });
  }

  // Validar que la nueva contraseña sea diferente a la actual
  if (currentPassword === newPassword) {
    recordAttempt(customer_id, false);
    return res.status(400).json({
      success: false,
      message: 'La nueva contraseña debe ser diferente a la actual.',
    });
  }

  try {
    // Buscar al usuario en la base de datos por customer_id
    const { data: user, error: fetchError } = await supabase
      .from('usuarios')
      .select('user_id, customer_id, email, password, nombre, apellido')
      .eq('customer_id', customer_id)
      .single();

    if (fetchError || !user) {
      recordAttempt(customer_id, false);
      console.log(`❌ Usuario no encontrado: ${customer_id}`);
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado.',
      });
    }

    // Verificar la contraseña actual
    const isValidCurrentPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isValidCurrentPassword) {
      recordAttempt(customer_id, false);
      console.log(`❌ Contraseña actual incorrecta para: ${customer_id}`);
      return res.status(401).json({
        success: false,
        message: 'La contraseña actual es incorrecta.',
      });
    }

    // Encriptar la nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña en la base de datos
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ password: hashedNewPassword })
      .eq('customer_id', customer_id);

    if (updateError) {
      recordAttempt(customer_id, false);
      console.error(`💥 Error al actualizar contraseña:`, updateError);
      throw new Error('Error al actualizar la contraseña en la base de datos.');
    }

    // Registrar éxito
    recordAttempt(customer_id, true);
    console.log(`✅ Contraseña cambiada exitosamente para: ${user.email}`);

    // Enviar notificación por email (no bloquear si falla)
    try {
      console.log(`📧 Intentando enviar notificación de cambio de contraseña a: ${user.email}`);
      await resendService.sendPasswordChangeNotification(
        user.email,
        `${user.nombre} ${user.apellido}`,
        'Contraseña cambiada exitosamente'
      );
    } catch (emailError) {
      console.error('⚠️ Error al enviar email de notificación:', emailError);
      // No fallar la operación si el email no se envía
    }

    // Respuesta exitosa
    return res.status(200).json({
      success: true,
      message: 'Contraseña cambiada exitosamente.',
      data: {
        customer_id: user.customer_id,
        email: user.email,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    recordAttempt(customer_id, false);
    console.error(`💥 Error al cambiar contraseña para ${customer_id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor.',
      error: error.message,
    });
  }
};
