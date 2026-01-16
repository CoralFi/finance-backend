import { Request, Response } from 'express';
import conduitFinancial from '@/services/conduit/conduit-financial';
import { PaymentMethodService } from '@/services/paymentMethods/paymentMethodService';
import { GetPaymentMethodResponse } from '@/types/payment-methods';
import { AuthRequest } from "@/middleware/authMiddleware";

/**
 * Controlador para obtener un método de pago específico
 * GET /api/customers/:customerId/payment-methods/:paymentMethodId
 */
export const getPaymentMethodController = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { paymentMethodId } = req.params;
    const customerId = req.user?.conduit_id
    // Validar parámetros
    if (!customerId || !paymentMethodId) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID y Payment Method ID son requeridos',
      });
    }

    console.log(`Getting payment method ${paymentMethodId} for customer: ${customerId}`);

    // Obtener método de pago desde Conduit
    const conduitResponse = await conduitFinancial.getPaymentMethod(
      customerId,
      paymentMethodId
    );

    // Sincronizar con Supabase en segundo plano
    try {
      const existing = await PaymentMethodService.getPaymentMethodById(paymentMethodId);

      if (existing) {
        await PaymentMethodService.updatePaymentMethod(paymentMethodId, conduitResponse);
      } else {
        await PaymentMethodService.savePaymentMethod(conduitResponse, customerId);
      }
    } catch (dbError: any) {
      console.error('Error syncing with Supabase (non-blocking):', dbError.message);
    }

    const response: GetPaymentMethodResponse = {
      success: true,
      message: 'Método de pago obtenido exitosamente',
      paymentMethod: conduitResponse,
    };

    return res.status(200).json(response);
  } catch (error: any) {
    console.error('Error getting payment method:', error);

    // Manejar errores específicos de Conduit
    if (error.response) {
      const status = error.response.status || 500;

      if (status === 404) {
        return res.status(404).json({
          success: false,
          error: 'Método de pago no encontrado',
        });
      }

      return res.status(status).json({
        success: false,
        error: 'Error al obtener el método de pago de Conduit',
        details: error.response.data || { message: error.message },
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Error interno al obtener el método de pago',
      details: { message: error.message },
    });
  }
};
