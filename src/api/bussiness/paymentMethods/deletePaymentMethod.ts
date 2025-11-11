import { Request, Response } from 'express';
import conduitFinancial from '@/services/conduit/conduit-financial';
import { PaymentMethodService } from '@/services/paymentMethods/paymentMethodService';

/**
 * Controlador para eliminar un método de pago
 * DELETE /api/customers/:customerId/payment-methods/:paymentMethodId
 */
export const deletePaymentMethodController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { customerId, paymentMethodId } = req.params;

    // Validar parámetros
    if (!customerId || !paymentMethodId) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID y Payment Method ID son requeridos',
      });
    }

    console.log(`Deleting payment method ${paymentMethodId} for customer: ${customerId}`);

    // Eliminar en Conduit
    await conduitFinancial.deletePaymentMethod(customerId, paymentMethodId);

    console.log('Payment method deleted in Conduit');

    // Marcar como deshabilitado en Supabase (soft delete)
    try {
      await PaymentMethodService.disablePaymentMethod(paymentMethodId);
      console.log('Payment method disabled in Supabase');
    } catch (dbError: any) {
      console.error('Error disabling in Supabase (non-blocking):', dbError.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Método de pago eliminado exitosamente',
    });
  } catch (error: any) {
    console.error('Error deleting payment method:', error);

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
        error: 'Error al eliminar el método de pago en Conduit',
        details: error.response.data || { message: error.message },
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Error interno al eliminar el método de pago',
      details: { message: error.message },
    });
  }
};
