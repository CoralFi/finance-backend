const getResetPasswordEmailBody = (name: string, resetLink: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px; background-color: #16a34a; padding: 20px; border-radius: 8px;">
        <h1 style="color: #ffffff !important; margin: 0;">CoralFinance</h1>
        <p style="color: #ffffff !important; margin: 5px 0 0 0; font-size: 16px; opacity: 0.9;">Restablecimiento de Contraseña</p>
      </div>

      <div style="background-color: #262626; padding: 25px; border-radius: 12px; border-left: 4px solid #16a34a; color: #ffffff;">
        <h2 style="color: #ffffff !important; margin-top: 0; margin-bottom: 20px;">Hola ${name},</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #ffffff !important;">
          Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón de abajo 
          para crear una nueva contraseña. Este enlace expirará en 30 minutos.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
            style="display: inline-block; padding: 14px 28px; font-size: 16px; font-weight: bold; text-decoration: none; 
                   border-radius: 8px; background-color: #16a34a; color: #ffffff !important;">
            Restablecer Contraseña
          </a>
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: #ffffff !important;">
          Si no solicitaste restablecer tu contraseña, puedes ignorar este mensaje de forma segura.
        </p>
        
        <p style="font-size: 14px; line-height: 1.6; color: #ffffff !important; margin-top: 20px;">
          Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
        </p>

        <p style="font-size: 12px; line-height: 1.4; color: #16a34a !important; background-color: #ffffff; 
                  padding: 10px; border-radius: 4px; word-break: break-all;">
          ${resetLink}
        </p>
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

export default getResetPasswordEmailBody;
