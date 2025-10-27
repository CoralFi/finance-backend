import { Request, Response } from 'express';
import conduitFinancial from '@/services/conduit/conduit-financial';
import { saveCustomerToDB } from '@/services/bussiness/signUp';

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

    // Validate country is a 2-letter country code, not a currency code
    if (country.length !== 2 || !/^[A-Z]{2}$/i.test(country)) {
      return res.status(400).json({
        success: false,
        message: 'El campo "country" debe ser un código de país de 2 letras (ej: US, CA, MX), no un código de moneda',
      });
    }
    const conduitResponse = await conduitFinancial.createCustomer(req.body);
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
      password,
      userId,
      recordType,
      businessInformation,
    });
    return res.status(201).json({
      success: true,
      message: 'Cliente creado correctamente en Conduit y guardado en la base de datos',
      data: {
        conduit: conduitResponse,
        db: supabaseResponse,
      },
    });
  } catch (error: any) {
    console.error('Error creating customer:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al crear cliente',
      error: error.message || error,
    });
  }
};
