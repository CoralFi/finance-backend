const getSendConfirmEmailBody = (name: string, confirmLink: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px; background-color: #16a34a; padding: 20px; border-radius: 8px;">
        <h1 style="color: #ffffff !important; margin: 0;">CoralFinance</h1>
        <p style="color: #ffffff !important; margin: 5px 0 0 0; font-size: 16px; opacity: 0.9;">Confirmación de Correo Electrónico</p>
      </div>

      <div style="background-color: #262626; padding: 25px; border-radius: 12px; border-left: 4px solid #16a34a; color: #ffffff;">
        <h2 style="color: #ffffff !important; margin-top: 0; margin-bottom: 20px;">Hola ${name},</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #ffffff !important;">
          ¡Bienvenido a CoralFinance! Para completar tu registro y activar tu cuenta, necesitamos verificar tu dirección de correo electrónico.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmLink}" style="display: inline-block; padding: 14px 28px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 8px; background-color: #16a34a; color: #ffffff !important;">
            Confirmar Correo Electrónico
          </a>
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: #ffffff !important;">
          Una vez que confirmes tu correo, podrás acceder a todas las funcionalidades de tu cuenta CoralFinance.
        </p>
        
        <div style="margin-top: 20px; padding: 15px; border-radius: 8px; background-color: rgba(255, 255, 255, 0.1);">
          <p style="font-size: 14px; line-height: 1.6; color: #ffffff !important; margin: 0;">
            <strong>¿Por qué verificamos tu correo?</strong>
          </p>
          <ul style="font-size: 14px; line-height: 1.6; color: #ffffff !important; margin-top: 10px;">
            <li>Para proteger tu cuenta y mantenerla segura</li>
            <li>Para enviarte notificaciones importantes sobre tu cuenta</li>
            <li>Para cumplir con las regulaciones de seguridad financiera</li>
          </ul>
        </div>
        
        <p style="font-size: 14px; line-height: 1.6; color: #ffffff !important; margin-top: 20px;">
          Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
        </p>
        <p style="font-size: 12px; line-height: 1.4; color: #16a34a !important; background-color: #ffffff; padding: 10px; border-radius: 4px; word-break: break-all;">
          ${confirmLink}
        </p>
        
        <p style="font-size: 14px; line-height: 1.6; color: #ffffff !important; margin-top: 20px;">
          Si no creaste una cuenta en CoralFinance, puedes ignorar este mensaje de forma segura.
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

export default getSendConfirmEmailBody;
