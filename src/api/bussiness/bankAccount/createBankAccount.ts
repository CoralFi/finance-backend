import { Request, Response } from 'express';
import conduitFinancial from '@/services/conduit/conduit-financial';
import { CounterpartyService } from '@/services/counterparties/counterpartyService';
import { CounterpartyResponse } from '@/types/counterparties';


const is_development = process.env.NODE_ENV === 'development';

export const createBankAccountController = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      type,
      // Campos para business
      businessName,
      website,
      // Campos para individual
      firstName,
      middleName,
      lastName,
      birthDate,
      nationality,
      // Comunes
      address,
      email,
      phone,
      identificationType,
      identificationNumber,
      customerId,
      paymentMethods,
    } = req.body;

    if (!type || (type !== 'business' && type !== 'individual')) {
      return res.status(400).json({
        success: false,
        message: 'El campo type debe ser "business" o "individual".',
      });
    }

    // Validaciones específicas por tipo de counterparty
    if (type === 'business') {
      if (!businessName || !website) {
        return res.status(400).json({
          success: false,
          message: 'Para tipo business se requieren businessName y website.',
        });
      }
    } else if (type === 'individual') {
      if (!firstName || !lastName || !birthDate || !nationality) {
        return res.status(400).json({
          success: false,
          message: 'Para tipo individual se requieren firstName, lastName, birthDate y nationality.',
        });
      }
    }

    // Validaciones comunes
    if (
      !email || !phone ||
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
      const { type: methodType } = method;

      if (!methodType) {
        return res.status(400).json({
          success: false,
          message: 'Cada paymentMethod debe incluir el campo type.',
        });
      }

      if (methodType === 'bank') {
        const {
          accountOwnerName,
          bankName,
          currency,
          rail,
          routingNumber,
          accountNumber,
          accountType,
          address: bankAddress,
        } = method;

        if (
          !accountOwnerName || !bankName || !currency || !rail ||
          !accountNumber || !accountType || !bankAddress
        ) {
          return res.status(400).json({
            success: false,
            message: 'Faltan campos obligatorios en uno de los paymentMethods de tipo bank.',
          });
        }

        if (!bankAddress.country) {
          return res.status(400).json({
            success: false,
            message: 'Cada paymentMethod de tipo bank debe tener un address con country.',
          });
        }
      } else if (methodType === 'wallet') {
        const { walletAddress, rail } = method;

        if (!walletAddress || !rail) {
          return res.status(400).json({
            success: false,
            message: 'Faltan campos obligatorios en uno de los paymentMethods de tipo wallet.',
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: `Tipo de paymentMethod no soportado: ${methodType}.`,
        });
      }
    }

    // Construir payload explícito para Conduit según el tipo
    let payload: any;

    if (type === 'business') {
      payload = {
        type: 'business',
        businessName,
        website,
        email,
        phone,
        customerId,
        identificationType,
        identificationNumber,
        address,
        paymentMethods,
      };
    } else {
      payload = {
        type: 'individual',
        firstName,
        middleName,
        lastName,
        birthDate,
        nationality,
        email,
        phone,
        customerId,
        identificationType,
        identificationNumber,
        address,
        paymentMethods,
      };
    }

    // Crear counterparty en Conduit
    const data = await conduitFinancial.createBankAccounts(payload);

    // Guardar counterparty en Supabase
    try {
      const counterpartyResponse = data as CounterpartyResponse;
      await CounterpartyService.saveCounterparty(counterpartyResponse);
      if (is_development) {
        console.log('✅ Counterparty guardado en Supabase:', counterpartyResponse.id);
      }
    } catch (dbError: any) {
      console.error('⚠️ Error al guardar counterparty en Supabase:', dbError);
      // No fallar la request si Supabase falla, pero loguearlo
    }

    return res.status(201).json({
      success: true,
      message: 'Cuenta bancaria externa registrada correctamente',
      data,
    });
  } catch (error: any) {
    console.error('❌ Error al registrar cuenta bancaria externa:', error.response.data);
    return res.status(500).json({
      success: false,
      message: 'Error al registrar cuenta bancaria externa',
      error: error.response.data || error.message || error,
    });
  }
};
