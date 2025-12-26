import { Request, Response } from 'express';
import conduitFinancial from '@/services/conduit/conduit-financial';
import { saveCustomerToDB } from '@/services/bussiness/signUp';
import bcrypt from 'bcrypt';
import { verifyUser } from '@/services/userService';
import { ApiResponse } from "@/services/types/request.types";
import supabase from "../../../db/supabase";

export const createCustomerController = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      businessLegalName,
      country,
      isDirectSetup,
      email,
      phone,
      password,
      userId,
      recordType,
      businessInformation
    } = req.body;
    if (
      !businessLegalName ||
      !country ||
      typeof isDirectSetup !== 'boolean' ||
      !email ||
      !phone ||
      !password ||
      typeof recordType !== 'number'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios en el cuerpo de la solicitud',
        requiredFields: [
          'businessLegalName',
          'country',
          'isDirectSetup',
          'email',
          'phone',
          'password',
          'recordType',

        ]
      });
    }

    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Validate country is a 2-letter country code, not a currency code
    // if (country.length !== 2 || !/^[A-Z]{2}$/i.test(country)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'El campo "country" debe ser un código de país de 2 letras (ej: US, CA, MX), no un código de moneda',
    //   });
    // }
    // Verify if the user already exists

    const userExists = await verifyUser(email);
    console.log("userExists", userExists);
    if (userExists !== undefined) {
      throw new Error("USER_EXISTS");
    }


    const conduitResponse = await conduitFinancial.createCustomer(req.body);
    console.log("conduitResponse", conduitResponse);
    const conduitCustomerId = conduitResponse?.id;
    if (!conduitCustomerId) {
      return res.status(500).json({
        success: false,
        message: 'No se recibió un customerId válido de Conduit',
      });
    }


    const supabaseResponse = await saveCustomerToDB({
      conduitCustomerId,
      businessLegalName,
      country,
      isDirectSetup,
      email,
      phone,
      hashedPassword,
      userId,
      recordType,
      businessInformation,
    });
    const account = await conduitFinancial.getCustomer(conduitCustomerId);
    const sameName = account.paymentMethods[0]
    const sameNameAccount = {
      payment_method_id: sameName?.id,
      customer_id: conduitCustomerId,
      type: sameName.type,
      status: sameName.status,
      bank_name: sameName.bankName,
      account_owner_name: sameName.accountOwnerName,
      account_number: sameName.accountNumber,
      account_type: sameName.accountType,
      routing_number: sameName.routingNumber,
      swift_code: sameName.swiftCode,
      iban: sameName.iban,
      branch_code: sameName.branchCode,
      bank_code: sameName.bankCode,
      sort_code: sameName.sortCode,
      pix_key: sameName.pixKey,
      wallet_address: null,
      wallet_label: null,
      rail: sameName.rail,
      currency: sameName.currency,
      address: null,
      entity_info: null,
      metadata: null,
      counterparty_id: null,
      active: true
    }
    try {
      const { error: insertError } = await supabase
        .from("conduit_payment_methods")
        .insert([sameNameAccount]);

      if (insertError) {
        console.error("Error insertando método de pago en Supabase:", insertError.message);
      }
    } catch (err: any) {
      console.error("Excepción al guardar método de pago:", err.message);
    }
    return res.status(201).json({
      success: true,
      message: 'Cliente creado correctamente en Conduit y guardado en la base de datos',
      data: {
        conduit: conduitResponse,
        db: supabaseResponse,
        sameNameAccount
      },
    });
  } catch (error: any) {
    if (error.message === "USER_EXISTS") {
      return res.status(409).json({
        success: false,
        message: "El usuario ya existe.",
        error: "USER_EXISTS"
      } as ApiResponse);

    }


    console.error('Error creating customer:', error.response?.data);
    return res.status(500).json({
      success: false,
      message: 'Error al crear cliente',
      error: error.message || error,
    });
  }
};
