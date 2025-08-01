const getConfirmResetPasswordEmailBody = (name) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px; background-color: #16a34a; padding: 20px; border-radius: 8px;">
        <h1 style="color: #ffffff !important; margin: 0;">CoralFinance</h1>
        <p style="color: #ffffff !important; margin: 5px 0 0 0; font-size: 16px; opacity: 0.9;">Confirmación de Cambio de Contraseña</p>
      </div>

      <div style="background-color: #262626; padding: 25px; border-radius: 12px; border-left: 4px solid #16a34a; color: #ffffff;">
        <h2 style="color: #ffffff !important; margin-top: 0; margin-bottom: 20px;">Hola ${name},</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #ffffff !important;">Te confirmamos que tu contraseña ha sido cambiada exitosamente.</p>

        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; padding: 14px 28px; font-size: 16px; font-weight: bold; border-radius: 8px; background-color: #ffffff; color: #16a34a !important;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 8px;">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            Contraseña Actualizada
          </div>
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: #ffffff !important;">Si no realizaste este cambio, por favor contacta inmediatamente a nuestro equipo de soporte.</p>
        
        <div style="margin-top: 20px; padding: 15px; border-radius: 8px; background-color: rgba(255, 255, 255, 0.1);">
          <p style="font-size: 14px; line-height: 1.6; color: #ffffff !important; margin: 0;">
            <strong>Recomendaciones de seguridad:</strong>
          </p>
          <ul style="font-size: 14px; line-height: 1.6; color: #ffffff !important; margin-top: 10px;">
            <li>Nunca compartas tu contraseña con nadie</li>
            <li>Utiliza contraseñas únicas para cada servicio</li>
            <li>Activa la autenticación de dos factores cuando sea posible</li>
          </ul>
        </div>
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

export default getConfirmResetPasswordEmailBody;