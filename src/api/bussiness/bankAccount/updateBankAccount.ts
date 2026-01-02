import { Request, Response } from 'express';
import conduitFinancial from '@/services/conduit/conduit-financial';
import supabase from '@/db/supabase';

export const updateBankAccountController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'El ID del counterparty es obligatorio en el path.',
      });
    }

    const updatePayload = req.body;

    if (
      !updatePayload ||
      typeof updatePayload !== 'object' ||
      Object.keys(updatePayload).length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Debes enviar al menos un campo para actualizar.',
      });
    }

    const existingAccount = await conduitFinancial.getBankAccountsById(id);

    const accountNotFound =
      !existingAccount ||
      (Array.isArray(existingAccount) && existingAccount.length === 0) ||
      (typeof existingAccount === 'object' &&
        !Array.isArray(existingAccount) &&
        Object.keys(existingAccount).length === 0);

    if (accountNotFound) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró la cuenta bancaria con el ID proporcionado.',
      });
    }


    const updatedCounterparty =
      await conduitFinancial.updateBankAccount(id, updatePayload);

    const accountUpdated = await conduitFinancial.getBankAccountsById(id);

    const paymentMethods = accountUpdated.paymentMethods || [];

    const paymentMethodIds = Array.isArray(paymentMethods)
      ? paymentMethods
        .filter((pm: any) => pm?.id)
        .map((pm: any) => pm.id)
      : [];

    const { error } = await supabase
      .from('conduit_counterparties')
      .update({
        type: accountUpdated.type,
        business_name: accountUpdated.businessName || null,
        website: accountUpdated.website || null,
        email: accountUpdated.email || null,
        phone: accountUpdated.phone || null,
        identification_type: accountUpdated.identificationType || null,
        identification_number: accountUpdated.identificationNumber || null,
        address: accountUpdated.address || null,
        payment_method_ids: paymentMethodIds,
        raw_response: accountUpdated,
        conduit_updated_at: new Date().toISOString(),
      })
      .eq('counterparty_id', id);

    if (error) {
      console.error('Error actualizando Supabase:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al sincronizar counterparty en base de datos',
      });
    }


    return res.status(200).json({
      success: true,
      message: 'Cuenta bancaria actualizada correctamente',
      data: updatedCounterparty,
    });
  } catch (error: any) {
    console.error(
      'Error al actualizar cuenta bancaria:',
      error?.response?.data || error
    );

    return res.status(500).json({
      success: false,
      message: 'Error al actualizar cuenta bancaria',
      error: error?.message || 'Internal server error',
    });
  }
};
