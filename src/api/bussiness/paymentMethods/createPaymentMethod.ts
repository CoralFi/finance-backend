import { Request, Response } from 'express';
import conduitFinancial from '@/services/conduit/conduit-financial';
import { PaymentMethodService } from '@/services/paymentMethods/paymentMethodService';
import {
  CreatePaymentMethodRequest,
  CreatePaymentMethodResponse,
} from '@/types/payment-methods';

/**
 * Controlador para crear un método de pago para un customer
 * POST /api/customers/:customerId/payment-methods
 */
export const createPaymentMethodController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { customerId } = req.params;
    const paymentMethodData: CreatePaymentMethodRequest = req.body;

    // Validar que el customerId esté presente
    if (!customerId) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID es requerido',
      });
    }

    // Validar datos básicos
    if (!paymentMethodData.type) {
      return res.status(400).json({
        success: false,
        error: 'El tipo de método de pago es requerido',
      });
    }

    // Validaciones específicas por tipo
    if (paymentMethodData.type === 'bank') {
      const requiredFields = ['currency', 'rail', 'bankName', 'accountOwnerName', 'accountNumber', 'accountType'];
      const missingFields = requiredFields.filter(field => !paymentMethodData[field as keyof typeof paymentMethodData]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Campos requeridos faltantes para cuenta bancaria: ${missingFields.join(', ')}`,
        });
      }
    } else if (paymentMethodData.type === 'wallet') {
      if (!paymentMethodData.rail || !paymentMethodData.walletAddress) {
        return res.status(400).json({
          success: false,
          error: 'Rail y walletAddress son requeridos para wallets',
        });
      }
    }

    console.log(`Creating payment method for customer: ${customerId}`);

    // Crear método de pago en Conduit
    const conduitResponse = await conduitFinancial.createPaymentMethod(
      customerId,
      paymentMethodData
    );

    console.log('Payment method created in Conduit:', conduitResponse.id);

    // Guardar en Supabase
    try {
      await PaymentMethodService.savePaymentMethod(conduitResponse, customerId);
      console.log('Payment method saved to Supabase');
    } catch (dbError: any) {
      console.error('Error saving to Supabase (non-blocking):', dbError.message);
      // No bloqueamos la respuesta si falla Supabase
    }

    const response: CreatePaymentMethodResponse = {
      success: true,
      message: 'Método de pago creado exitosamente',
      paymentMethod: conduitResponse,
    };

    return res.status(201).json(response);
  } catch (error: any) {
    console.error('Error creating payment method:', error);

    // Manejar errores específicos de Conduit
    if (error.response) {
      return res.status(error.response.status || 500).json({
        success: false,
        error: 'Error al crear el método de pago en Conduit',
        details: error.response.data || { message: error.message },
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Error interno al crear el método de pago',
      details: { message: error.message },
    });
  }
};
