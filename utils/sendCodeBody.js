

// Obtiene el HTML para el correo de código de verificación
const getCodeEmailBody = (email, code) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px; background-color: #16a34a; padding: 20px; border-radius: 8px;">
        <h1 style="color: #ffffff !important; margin: 0;">CoralFinance</h1>
        <p style="color: #ffffff !important; margin: 5px 0 0 0; font-size: 16px; opacity: 0.9;">Código de Verificación</p>
      </div>

      <div style="background-color: #262626; padding: 25px; border-radius: 12px; border-left: 4px solid #16a34a; color: #ffffff;">
        <h2 style="color: #ffffff !important; margin-top: 0; margin-bottom: 20px;">Hola ${email},</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #ffffff !important;">Para continuar con tu proceso, introduce el siguiente código de verificación. El código expira en 15&nbsp;minutos.</p>

        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; padding: 14px 28px; font-size: 28px; font-weight: bold; letter-spacing: 4px; border-radius: 8px; background-color: #ffffff !important; color: #16a34a !important; font-family: 'Courier New', monospace;">
            ${code}
          </span>
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: #ffffff !important;">Si no solicitaste este código, puedes ignorar este mensaje de forma segura.</p>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
        <p style="font-size: 14px; color: black !important; margin: 0 !important;">
          Este email fue enviado automáticamente desde el sistema CoralFinance.<br>
          <strong>No responder a este correo.</strong>
        </p>
      </div>
    </div>
  `;
};

export default getCodeEmailBody;