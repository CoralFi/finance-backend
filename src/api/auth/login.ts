import { Request, Response } from "express";
import bcrypt from "bcrypt";
import supabase from "../../db/supabase";
import { FernKycStatus, getFernWalletCryptoInfo } from "@/services/fern/fernServices";
import { UserInfo, FernUser } from "@/services/types/types";



export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    // Buscar usuario por email
    const { data: user_exists, error: user_exists_error } = await supabase.
    rpc("exists_user", { p_email: email })
    .single() as { data: UserInfo | null, error: any };

    console.log("Usuario encontrado:", user_exists);

    if (user_exists_error || !user_exists) {
      console.error("Error buscando usuario:", user_exists_error);
      res.status(400).json({ message: "Usuario no encontrado." });
      return;
    }

    //get user base info 
    const { data: user, error: user_error } = await supabase
      .rpc("get_user_info_2", { p_customer_id: user_exists.customer_id })
      .single() as { data: UserInfo | null, error: any };

    console.log("Usuario encontrado:", user);
    if (user_error || !user) {
      console.error("Error buscando datos del usuario:", user_error);
      res.status(400).json({ message: "Usuario no encontrado." });
      return;
    }

    // Comparar contraseñas
    const isValidPassword = await bcrypt.compare(password, user.password as string);
    if (!isValidPassword) {
      res.status(401).json({ message: "Contraseña incorrecta." });
      return;
    }

    // Buscar datos Fern asociados
    const { data: fern, error: fernError } = await supabase
    .rpc("get_fern_user_info", { p_customer_id: user.customer_id })
    .single() as { data: any, error: any };
    // console.log("Datos Fern:", fern);

    if (fernError) {
      console.warn("Error buscando datos Fern:", fernError.message);
    }

    // Transform database fields to match FernUser interface
    user.fern = fern ? {
      customer_id: fern.customer_id,
      fernCustomerId: fern.ferncustomerid,
      fernWalletId: fern.fernwalletid,
      kyc: fern.kyc,
      kycStatus: fern.kycstatus || fern.kyc,
      businessname: fern.businessname,
      organizationid: fern.organizationid
    } : undefined;
    console.log("Datos Fern:", user.fern);
    let fernKycStatus = { kycStatus: null, kycLink: null };

    // Consultar estado de KYC en Fern
    if (user.fern?.fernCustomerId) {
      try {
        fernKycStatus = await FernKycStatus(user.fern?.fernCustomerId, user.user_id.toString());

        if ((fernKycStatus as any)?.error) {
          console.warn("Fern API error:", (fernKycStatus as any).error);
        }
      } catch (fernError: any) {
        console.error("Error inesperado con Fern KYC:", fernError.message);
      }
    }

    const { data: user_info_data, error: user_info_error } = await supabase.rpc(
      "user_info_exists",
      { p_user_id: user.user_id }
    );
    if (user_info_error) {
      console.error("Error verificando user info:", user_info_error.message);
      res.status(500).json({ message: "Error al iniciar sesión." });
      return;
    }
    let fernWalletCryptoInfo: any = null;
    if (user.fern?.fernWalletId) {
      try {
        fernWalletCryptoInfo = await getFernWalletCryptoInfo(user.fern?.fernWalletId);
        if (fernWalletCryptoInfo === null) {
          console.warn("No se encontró info de la billetera Fern:", user.fern?.fernWalletId);
        }
      } catch (walletError: any) {
        console.error("Error obteniendo info de billetera Fern:", walletError.message);
      }
    }
    console.log("Inicio de sesión exitoso:", user.email);

    res.status(200).json({
      message: "Inicio de sesión exitoso.",
      user: {
        id: user.user_id,
        email: user.email,
        firstName: user.nombre,
        lastName: user.apellido,
        userType: user.user_type,
        google_auth: user.google_auth,
        tos: user.tos_coral,
        fernCustomerId: user.fern?.fernCustomerId || null,
        fernWalletId: user.fern?.fernWalletId || null,
        fernWalletAddress: fernWalletCryptoInfo?.fernCryptoWallet?.address || null,
        KycFer: fernKycStatus?.kycStatus || null,
        KycLinkFer: fernKycStatus?.kycLink || null,
        fernBusinessName: user.fern?.businessname || null,
        user_info: user_info_data || false,
      },
    });
  } catch (error: any) {
    console.error("Error al iniciar sesión:", error.message);
    res.status(500).json({
      message: "Error al iniciar sesión.",
      error: error.message,
    });
  }
};
