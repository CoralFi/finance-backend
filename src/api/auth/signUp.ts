import { Request, Response } from "express";
import bcrypt from "bcrypt";
import supabase from "../../db/supabase";
import { verifyUser, createUser } from "../../services/userService";
// import { createFernCustomer } from "../../services/fernServices";

export const registerUser = async (req: Request, res: Response) => {
  const {
    email,
    password,
    nombre,
    apellido,
    userType,
    tosCoral,
    businessName,
    phoneNumber,
    birthDate,
    recentOccupation,
    employmentStatus,
    accountPurpose,
    fundsOrigin,
    expectedAmount,
    country,
    addressLine1,
    addressLine2,
    city,
    stateRegionProvince,
    postalCode,
    recordType,
  } = req.body;


  if (recordType === undefined || recordType === null) {
    res.status(400).json({
      message: "El campo 'recordType' es obligatorio.",
      required: ["recordType"],
      received: { recordType: !!recordType },
    });
    return;
  }

  if (recordType === 0) {
    if (!email || !nombre || !apellido || !userType || !tosCoral) {
      res.status(400).json({
        message: "Faltan campos obligatorios para tipo de registro rápido.",
        required: ["email", "password", "nombre", "apellido", "userType", "tosCoral"],
        received: {
          email: !!email,
          nombre: !!nombre,
          apellido: !!apellido,
          userType: !!userType,
          tosCoral: !!tosCoral,
          password: !!password,
        },
      });
      return;
    }
  } else if (recordType === 1) {
    if (
      !email ||
      !password ||
      !nombre ||
      !apellido ||
      !userType ||
      !tosCoral ||
      !phoneNumber ||
      !birthDate ||
      !recentOccupation ||
      !employmentStatus ||
      !accountPurpose ||
      !fundsOrigin ||
      !expectedAmount ||
      !country ||
      !addressLine1 ||
      !city ||
      !stateRegionProvince ||
      !postalCode
    ) {
      res.status(400).json({
        message: "Todos los campos son obligatorios para tipo de registro completo.",
        required: [
          "email",
          "password",
          "nombre",
          "apellido",
          "userType",
          "tosCoral",
          "phoneNumber",
          "birthDate",
          "recentOccupation",
          "employmentStatus",
          "accountPurpose",
          "fundsOrigin",
          "expectedAmount",
          "country",
          "addressLine1",
          "city",
          "stateRegionProvince",
          "postalCode",
        ],
        received: {
          email: !!email,
          password: !!password,
          nombre: !!nombre,
          apellido: !!apellido,
          userType: !!userType,
          tosCoral: !!tosCoral,
          phoneNumber: !!phoneNumber,
          birthDate: !!birthDate,
          recentOccupation: !!recentOccupation,
          employmentStatus: !!employmentStatus,
          accountPurpose: !!accountPurpose,
          fundsOrigin: !!fundsOrigin,
          expectedAmount: !!expectedAmount,
          country: !!country,
          addressLine1: !!addressLine1,
          city: !!city,
          stateRegionProvince: !!stateRegionProvince,
          postalCode: !!postalCode,
        },
      });
      return;
    }
  } else {
    res.status(400).json({
      message: "El valor de 'recordType' no es válido. Debe ser 0 o 1.",
      received: { recordType },
    });
    return;
  }

  try {
    await supabase.rpc("begin");

    const verifyUsers = await verifyUser(email);
    console.log(verifyUsers)
    if (!verifyUsers) {
      await supabase.rpc("rollback");
      res.status(400).json({ message: "El usuario ya existe." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await createUser({
      email,
      password: hashedPassword,
      nombre,
      apellido,
      userType,
      tosCoral,
      phoneNumber,
      birthDate,
      recentOccupation,
      employmentStatus,
      accountPurpose,
      fundsOrigin,
      expectedAmount,
      country,
      addressLine1,
      addressLine2,
      city,
      stateRegionProvince,
      postalCode,
      recordType,
    });


  } catch (error: any) {
    try {
      await supabase.rpc("rollback");
    } catch (rollbackError) {
      console.error("Error al hacer rollback:", rollbackError);
    }

    console.error("Error al crear el usuario:", error);
    res.status(500).json({
      message: "Error al crear el usuario.",
      error: error.message,
    });
  }
};
