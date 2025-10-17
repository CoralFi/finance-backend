import { Request, Response } from "express";
import bcrypt from "bcrypt";
import supabase from "../../db/supabase";
import { getUserByEmail } from './helpers/authHelpers';
import { getFernData, fetchFernRelatedData } from './helpers/fernHelpers';

export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: "Email y contraseña son requeridos." });
  }

  try {
    // 1. Get user by email
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // 2. Verify password
    const isValidPassword = await bcrypt.compare(password, user.password as string);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Contraseña incorrecta." });
    }

    // 3. Fetch Fern data
    const fernData = await getFernData(user.customer_id);
    user.fern = fernData;

    // 4. Fetch additional data in parallel
    const [fernRelatedData, userInfoExists] = await Promise.all([
      fetchFernRelatedData(fernData, user.user_id),
      supabase.rpc("user_info_exists", { p_user_id: user.user_id })
        .then(({ data, error }) => {
          if (error) {
            console.error("Error verificando user info:", error.message);
            return false;
          }
          return data || false;
        })
    ]);

    console.log("Inicio de sesión exitoso:", user.email);

    // 5. Return success response
    return res.status(200).json({
      message: "Inicio de sesión exitoso.",
      user: {
        id: user.user_id,
        email: user.email,
        firstName: user.nombre,
        lastName: user.apellido,
        userType: user.user_type,
        google_auth: user.google_auth,
        tos: user.tos_coral,
        fernCustomerId: fernData?.fernCustomerId || null,
        fernWalletId: fernData?.fernWalletId || null,
        fernWalletAddress: fernRelatedData.walletAddress,
        KycFer: fernRelatedData.kycStatus,
        KycLinkFer: fernRelatedData.kycLink,
        fernBusinessName: fernData?.businessname || null,
        user_info: userInfoExists
      }
    });
  } catch (error: any) {
    console.error("Error al iniciar sesión:", error.message);
    return res.status(500).json({
      message: "Error al iniciar sesión.",
      error: error.message
    });
  }
};
