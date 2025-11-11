import { Request, Response } from 'express';
import conduitFinancial from '@/services/conduit/conduit-financial';
import { PaymentMethodService } from '@/services/paymentMethods/paymentMethodService';
import { ListPaymentMethodsResponse } from '@/types/payment-methods';

/**
 * Controlador para listar métodos de pago de un customer
 * GET /api/customers/:customerId/payment-methods
 */
export const listPaymentMethodsController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { customerId } = req.params;

    // Validar que el customerId esté presente
    if (!customerId) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID es requerido',
      });
    }

    console.log(`Listing payment methods for customer: ${customerId}`);

    // Obtener métodos de pago desde Conduit
    const conduitResponse = await conduitFinancial.listPaymentMethods(customerId);

    // Sincronizar con Supabase en segundo plano
    //  Esto no es necesario por ahora, ademas que consume tiempo
    // try {
    //   // Guardar o actualizar cada método de pago en Supabase
    //   if (conduitResponse.data && Array.isArray(conduitResponse.data)) {
    //     for (const paymentMethod of conduitResponse.data) {
    //       const existing = await PaymentMethodService.getPaymentMethodById(paymentMethod.id);
          
    //       if (existing) {
    //         await PaymentMethodService.updatePaymentMethod(paymentMethod.id, paymentMethod);
    //       } else {
    //         await PaymentMethodService.savePaymentMethod(paymentMethod, customerId);
    //       }
    //     }
    //   }
    // } catch (dbError: any) {
    //   console.error('Error syncing with Supabase (non-blocking):', dbError.message);
    // }


    const response: ListPaymentMethodsResponse = {
      success: true,
      message: 'Métodos de pago obtenidos exitosamente',
      count: conduitResponse.data?.length || 0,
      paymentMethods: conduitResponse.data || [],
    };

    return res.status(200).json(response);
  } catch (error: any) {
    console.error('Error listing payment methods:', error);

    // Manejar errores específicos de Conduit
    if (error.response) {
      return res.status(error.response.status || 500).json({
        success: false,
        error: 'Error al obtener los métodos de pago de Conduit',
        details: error.response.data || { message: error.message },
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Error interno al obtener los métodos de pago',
      details: { message: error.message },
    });
  }
};
