import { Request, Response } from "express";
import bcrypt from "bcrypt";
import supabase from "../../db/supabase";
import { getUserByEmail } from './helpers/authHelpers';
import { getFernData, fetchFernRelatedData } from './helpers/fernHelpers';
import conduitFinancial from "@/services/conduit/conduit-financial";
export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const isDeveloment = process.env.NODE_ENV === "development";

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

    // 2.1. Verify if user is a business user
    const isBusinessUser = user.user_type === 'business';
    let fernData;
    if (!isBusinessUser) {
      fernData = await getFernData(user.customer_id);
      user.fern = fernData;
    }

    // 4. Fetch additional data in parallel
    const [fernRelatedData, userInfoExists, conduitUser] = await Promise.all([
      // Fetch Fern related data only for non-business users
      isBusinessUser ? Promise.resolve(null) : fetchFernRelatedData(fernData!, user.user_id),
      supabase.rpc("user_info_exists", { p_user_id: user.user_id })
        .then(({ data, error }) => {
          if (error) {  
            console.error("Error verificando user info:", error.message);
            return false;
          }
          return data || false;
        }),
      // Fetch Conduit data only if conduit_id exists
      user.conduit_id 
        ? conduitFinancial.getCustomer(user.conduit_id)
            .then((data) => {
              return data || null;
            })
            .catch((error) => {
              console.error("Error buscando datos de Conduit:", error.message);
              return null;
            })
        : Promise.resolve(null)
    ]);

    if (isDeveloment) {
      console.log("Inicio de sesión exitoso:", user.email);
      console.log("Conduit user:", conduitUser);
    }

    // 5. Return success response
    return res.status(200).json({
      message: "Inicio de sesión exitoso.",
      user: {
        customer_id: user.customer_id,
        email: user.email,
        firstName: user.nombre,
        lastName: user.apellido,
        userType: user.user_type,
        google_auth: user.google_auth,
        tos: user.tos_coral,
        fernCustomerId: fernData?.fernCustomerId || null,
        fernWalletId: fernData?.fernWalletId || null,
        fernWalletAddress: fernRelatedData?.walletAddress || null,
        KycFer: fernRelatedData?.kycStatus || null,
        KycLinkFer: fernRelatedData?.kycLink || null,
        fernBusinessName: fernData?.businessname || null,
        user_info: userInfoExists,
        conduit_id: user?.conduit_id,
        conduit_kyb_status: conduitUser?.status,
        conduit_kyb_link: conduitUser?.kybLink,
        conduit_kyb_expires_at: conduitUser?.kybLinkExpiration,        
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
