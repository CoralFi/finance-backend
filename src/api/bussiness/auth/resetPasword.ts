import { Request, Response } from "express";
import supabase from '../../../db/supabase';
import ResendService from '../../../services/emails/resend';

import bcrypt from "bcrypt";

const resendService = new ResendService();

export const resetPasswordHandler = async (req: Request, res: Response): Promise<void> => {
  const { token, email } = req.query;
  const { newPassword } = req.body;
  console.log(newPassword)
  if (typeof token !== "string" || typeof email !== "string") {
    res.status(400).send({
      success: false,
      message: "Token o email inválido",
    });
    return;
  }

  if (!newPassword) {
    res.status(400).send({
      success: false,
      message: "La nueva contraseña es requerida",
    });
    return;
  }

  // Buscar al usuario
  const { data, error } = await supabase
    .from("business")
    .select("*")
    .eq("business_email", email)
    .eq("reset_token", token)
    .single();
  console.log(data)
  if (error || !data) {
    res.status(400).send({
      success: false,
      message: "Token inválido o correo electrónico",
    });
    return;
  }

  // Comparar contraseñas
  const isSamePassword = await bcrypt.compare(newPassword, data.password);
  if (isSamePassword) {
    res.status(400).send({
      success: false,
      message: "La nueva contraseña debe ser diferente a la contraseña actual",
    });
    return;
  }

  // Encriptar contraseña nueva
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const fullName = `${data.business_name} `;

  // Actualizar contraseña y resetear token
  const { error: updateError } = await supabase
    .from("business")
    .update({ password: hashedPassword, reset_token: null })
    .eq("business_email", email);

  if (updateError) {
    res.status(500).send({
      success: false,
      message: "Error updating password",
    });
    return;
  }

  // Enviar email de confirmación
  await resendService.sendConfirmResetPasswordEmail(
    email,
    fullName,
    "Confirmación de Cambio de Contraseña"
  );

  res.status(200).send({
    success: true,
    message: "Password reset successfully",
  });
};
