import bcrypt from "bcrypt";
import ResendService from "../../services/email/resend.js";
import supabase from "../v2/supabase.js";

// Rate limiting storage TODO: implementar Redis en un futuro
const attemptTracker = new Map();

// Función para verificar rate limiting
function checkRateLimit(email) {
    const key = `password_change_${email}`;
    const now = Date.now();
    const oneHour = 60 * 60 * 1000; // 1 hora
    
    if (!attemptTracker.has(key)) {
        attemptTracker.set(key, { count: 0, lastAttempt: now });
        return { allowed: true, remainingTime: 0 };
    }
    
    const data = attemptTracker.get(key);
    
    // Reset counter si ha pasado más de 1 hora
    if (now - data.lastAttempt > oneHour) {
        attemptTracker.set(key, { count: 0, lastAttempt: now });
        return { allowed: true, remainingTime: 0 };
    }
    
    // Verificar si excede el límite
    if (data.count >= 3) {
        const remainingTime = oneHour - (now - data.lastAttempt);
        return { allowed: false, remainingTime };
    }
    
    return { allowed: true, remainingTime: 0 };
}

// Función para registrar intento
function recordAttempt(email, success = false) {
    const key = `password_change_${email}`;
    const now = Date.now();
    
    if (!attemptTracker.has(key)) {
        attemptTracker.set(key, { count: 1, lastAttempt: now });
    } else {
        const data = attemptTracker.get(key);
        if (success) {
            // Reset counter en caso de éxito
            attemptTracker.set(key, { count: 0, lastAttempt: now });
        } else {
            // Incrementar contador en caso de fallo
            attemptTracker.set(key, { count: data.count + 1, lastAttempt: now });
        }
    }
}

export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*'); //todo: cambiar por la del front
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Manejar solicitudes OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        const { email, currentPassword, newPassword } = req.body;
        const resendService = new ResendService();
        // Logging de seguridad
        console.log(`🔐 Intento de cambio de contraseña para: ${email} - ${new Date().toISOString()}`);

        // Verificar rate limiting
        const rateLimitCheck = checkRateLimit(email);
        if (!rateLimitCheck.allowed) {
            const remainingMinutes = Math.ceil(rateLimitCheck.remainingTime / (1000 * 60));
            console.log(`🚫 Rate limit excedido para ${email}. Tiempo restante: ${remainingMinutes} minutos`);
            return res.status(429).json({ 
                success: false,
                message: `Demasiados intentos fallidos. Intenta nuevamente en ${remainingMinutes} minutos.` 
            });
        }

        // Validar campos requeridos
        if (!email || !currentPassword || !newPassword) {
            recordAttempt(email, false);
            return res.status(400).json({ 
                success: false,
                message: "Email, contraseña actual y nueva contraseña son obligatorios." 
            });
        }

        // Validar longitud de nueva contraseña
        if (newPassword.length < 6) {
            recordAttempt(email, false);
            return res.status(400).json({ 
                success: false,
                message: "La nueva contraseña debe tener al menos 6 caracteres." 
            });
        }

        // Validar que la nueva contraseña sea diferente a la actual
        if (currentPassword === newPassword) {
            recordAttempt(email, false);
            return res.status(400).json({ 
                success: false,
                message: "La nueva contraseña debe ser diferente a la actual." 
            });
        }

        try {
            // Buscar al usuario en la base de datos por email
            const { data: user, error: fetchError } = await supabase
                .from("usuarios")
                .select("user_id, email, password, nombre, apellido")
                .eq("email", email)
                .single();

            if (fetchError || !user) {
                recordAttempt(email, false);
                console.log(`❌ Usuario no encontrado: ${email}`);
                return res.status(404).json({ 
                    success: false,
                    message: "Usuario no encontrado." 
                });
            }

            // Verificar la contraseña actual
            const isValidCurrentPassword = await bcrypt.compare(currentPassword, user.password);

            if (!isValidCurrentPassword) {
                recordAttempt(email, false);
                console.log(`❌ Contraseña actual incorrecta para: ${email}`);
                return res.status(401).json({ 
                    success: false,
                    message: "La contraseña actual es incorrecta." 
                });
            }

            // Encriptar la nueva contraseña
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);

            // Actualizar la contraseña en la base de datos
            const { error: updateError } = await supabase
                .from("usuarios")
                .update({ password: hashedNewPassword })
                .eq("user_id", user.user_id);

            if (updateError) {
                recordAttempt(email, false);
                throw new Error("Error al actualizar la contraseña en la base de datos.");
            }

            // Registrar éxito
            recordAttempt(email, true);
            console.log(`✅ Contraseña cambiada exitosamente para: ${email}`);

            // Enviar notificación por email (no bloquear si falla)
            console.log(`📧 Intentando enviar notificación de cambio de contraseña a: ${user.email}`);
            await resendService.sendPasswordChangeNotification(user.email, user.nombre + " " + user.apellido, "Contraseña cambiada exitosamente");

            // Respuesta exitosa
            res.status(200).json({
                success: true,
                message: "Contraseña cambiada exitosamente.",
                data: {
                    userId: user.user_id,
                    email: user.email,
                    updatedAt: new Date().toISOString()
                }
            });

        } catch (error) {
            recordAttempt(email, false);
            console.error(`💥 Error al cambiar contraseña para ${email}:`, error);
            res.status(500).json({ 
                success: false,
                message: "Error interno del servidor.", 
                error: error.message 
            });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).json({
            success: false,
            message: `Método ${req.method} no permitido`
        });
    }
}
