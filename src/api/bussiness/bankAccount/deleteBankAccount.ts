import { Request, Response } from 'express';
import conduitFinancial from '@/services/conduit/conduit-financial';
import supabase from '@/db/supabase';

export const deleteBankAccountController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id, paymentMethodId } = req.params;

    if (!id || !paymentMethodId) {
      return res.status(400).json({
        success: false,
        message: 'El ID y paymentMethodId de la cuenta bancaria son obligatorios',
      });
    }
    await conduitFinancial.deleteBankAccount(id, paymentMethodId);

    const accountUpdated =
      await conduitFinancial.getBankAccountsById(id);

    if (!accountUpdated) {
      return res.status(404).json({
        success: false,
        message: 'Counterparty no encontrado luego de eliminar el payment method',
      });
    }


    const paymentMethods = accountUpdated.paymentMethods || [];

    const paymentMethodIds = Array.isArray(paymentMethods)
      ? paymentMethods
        .filter((pm: any) => pm?.id)
        .map((pm: any) => pm.id)
      : [];


    const { error } = await supabase
      .from('conduit_counterparties')
      .update({
        payment_method_ids: paymentMethodIds,
        raw_response: accountUpdated,
        conduit_updated_at: new Date().toISOString(),
      })
      .eq('counterparty_id', id);

    if (error) {
      console.error('Error actualizando Supabase:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al sincronizar payment methods en base de datos',
      });
    }

    const { error: pmError } = await supabase
      .from('conduit_payment_methods')
      .update({
        status: 'disabled',
        active: false,
        conduit_updated_at: new Date().toISOString(),
      })
      .eq('payment_method_id', paymentMethodId)

    if (pmError) {
      console.error('Error desactivando payment method:', pmError);
      return res.status(500).json({
        success: false,
        message: 'Error al desactivar el payment method en base de datos',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Cuenta bancaria eliminada y sincronizada correctamente',
      data: {
        removedPaymentMethodId: paymentMethodId,
        paymentMethodIds,
      },
    });
  } catch (error: any) {
    console.error(
      'Error al eliminar cuenta bancaria:',
      error?.response?.data || error
    );

    return res.status(500).json({
      success: false,
      message: 'Error al eliminar cuenta bancaria',
      error: error?.message || 'Internal server error',
    });
  }
};
