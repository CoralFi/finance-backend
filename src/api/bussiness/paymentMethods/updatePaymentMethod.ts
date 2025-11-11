import { Request, Response } from 'express';
import conduitFinancial from '@/services/conduit/conduit-financial';
import { PaymentMethodService } from '@/services/paymentMethods/paymentMethodService';

/**
 * Controlador para actualizar un método de pago
 * PATCH /api/customers/:customerId/payment-methods/:paymentMethodId
 */
export const updatePaymentMethodController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { customerId, paymentMethodId } = req.params;
    const updateData = req.body;

    // Validar parámetros
    if (!customerId || !paymentMethodId) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID y Payment Method ID son requeridos',
      });
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Datos de actualización son requeridos',
      });
    }

    console.log(`Updating payment method ${paymentMethodId} for customer: ${customerId}`);

    // Actualizar en Conduit
    const conduitResponse = await conduitFinancial.updatePaymentMethod(
      customerId,
      paymentMethodId,
      updateData
    );

    console.log('Payment method updated in Conduit');

    // Actualizar en Supabase
    try {
      await PaymentMethodService.updatePaymentMethod(paymentMethodId, conduitResponse);
      console.log('Payment method updated in Supabase');
    } catch (dbError: any) {
      console.error('Error updating in Supabase (non-blocking):', dbError.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Método de pago actualizado exitosamente',
      paymentMethod: conduitResponse,
    });
  } catch (error: any) {
    console.error('Error updating payment method:', error);

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
        error: 'Error al actualizar el método de pago en Conduit',
        details: error.response.data || { message: error.message },
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Error interno al actualizar el método de pago',
      details: { message: error.message },
    });
  }
};
