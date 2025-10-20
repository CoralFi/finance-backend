import { Request, Response } from "express";
import { authenticator } from "otplib";
import supabase from "../../db/supabase";

interface Generate2FAQuery {
  email?: string;
}

export const generate2FAController = async (
  req: Request<{}, any, any, Generate2FAQuery>,
  res: Response
): Promise<Response> => {

  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ message: "El parámetro 'email' es requerido." });
  }

  try {
    const decodedEmail = decodeURIComponent(email);
    const secret = authenticator.generateSecret();
    console.log(`🔑 Nueva clave secreta generada para ${decodedEmail}: ${secret}`);
    const { error: updateError } = await supabase
      .from("usuarios")
      .update({ qr_code: secret })
      .eq("email", decodedEmail);

    if (updateError) {
      console.error("Error al actualizar Supabase:", updateError);
      return res.status(500).json({ message: "Error al guardar el secreto en la base de datos." });
    }
    const issuerName = "CoralFinance";
    const otpauthUrl = authenticator.keyuri(decodedEmail, issuerName, secret);

    console.log(`✅ URL de Google Authenticator generada: ${otpauthUrl}`);

    return res.status(200).json({
      success: true,
      message: "Código QR generado exitosamente.",
      secret,
      qrCode: otpauthUrl,
    });
  } catch (error: any) {
    console.error("Error al generar el QR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error interno al generar el código QR.",
      error: error.message,
    });
  }
};
