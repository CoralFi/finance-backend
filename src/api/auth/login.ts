import { Request, Response } from "express";
import bcrypt from "bcrypt";
import supabase from "../../db/supabase";
import { FernKycStatus, getFernWalletCryptoInfo } from "../../services/fernServices";

export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    // Buscar usuario por email
    const { data: user, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      res.status(400).json({ message: "Usuario no encontrado." });
      return;
    }

    // Comparar contraseñas
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ message: "Contraseña incorrecta." });
      return;
    }

    // Buscar datos Fern asociados
    const { data: fern, error: fernError } = await supabase
      .from("fern")
      .select("*")
      .eq("user_id", user.user_id)
      .single();

    if (fernError) {
      console.warn("Error buscando datos Fern:", fernError.message);
    }

    user.fern = fern;
    let fernKycStatus = { kycStatus: null, kycLink: null };

    // Consultar estado de KYC en Fern
    if (user.fern?.fernCustomerId) {
      try {
        fernKycStatus = await FernKycStatus(user.fern?.fernCustomerId, user.user_id);

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
        kyc: user.estado_kyc,
        wallet: user.wallet_id,
        verificado_email: user.verificado_email,
        google_auth: user.google_auth,
        customerFiat: user.customer_id,
        tos: user.tos_coral,
        qr_payment: user.qr_payment,
        fernCustomerId: user.fern?.fernCustomerId || null,
        fernWalletId: user.fern?.fernWalletId || null,
        fernWalletAddress: fernWalletCryptoInfo?.fernCryptoWallet?.address || null,
        KycFer: fernKycStatus?.kycStatus || null,
        KycLinkFer: fernKycStatus?.kycLink || null,
        fernBusinessName: user.fern?.businessName || null,
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
