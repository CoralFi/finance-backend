import { Request, Response } from 'express';
import conduitFinancial from '@/services/conduit/conduit-financial';


export const createBankAccountController = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      type,
      businessName,
      website,
      address,
      email,
      phone,
      identificationType,
      identificationNumber,
      customerId,
      paymentMethods
    } = req.body;

    if (
      !type || !businessName || !website || !email || !phone ||
      !identificationType || !identificationNumber || !customerId ||
      !address || !paymentMethods || !Array.isArray(paymentMethods) || paymentMethods.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios en el cuerpo de la solicitud.',
      });
    }

    const { streetLine1, city, state, postalCode, country } = address;
    if (!streetLine1 || !city || !state || !postalCode || !country) {
      return res.status(400).json({
        success: false,
        message: 'La dirección principal debe contener streetLine1, city, state, postalCode y country.',
      });
    }

    for (const method of paymentMethods) {
      const {
        type: methodType,
        accountOwnerName,
        bankName,
        currency,
        rail,
        routingNumber,
        accountNumber,
        accountType,
        address: bankAddress
      } = method;

      if (
        !methodType || !accountOwnerName || !bankName || !currency || !rail ||
        !routingNumber || !accountNumber || !accountType || !bankAddress
      ) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos obligatorios en uno de los paymentMethods.',
        });
      }

      if (!bankAddress.country) {
        return res.status(400).json({
          success: false,
          message: 'Cada paymentMethod debe tener un address con country.',
        });
      }
    }

    const data = await conduitFinancial.createBankAccounts(req.body);

    return res.status(201).json({
      success: true,
      message: 'Cuenta bancaria externa registrada correctamente',
      data,
    });
  } catch (error: any) {
    console.error('Error al registrar cuenta bancaria externa:', error.response.data);
    return res.status(500).json({
      success: false,
      message: 'Error al registrar cuenta bancaria externa',
      error: error.response.data || error.message || error,
    });
  }
};
