import { Request, Response } from 'express';
import conduitFinancial from '@/services/conduit/conduit-financial';

export const updateBankAccountController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'El ID de la cuenta bancaria es obligatorio en el path.',
    });
  }
  const updatePayload = req.body;
  if (!updatePayload || Object.keys(updatePayload).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Debes enviar al menos un campo para actualizar.',
    });
  }
  try {
    const existingAccount = await conduitFinancial.getBankAccountsById(id);
    if (!existingAccount) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró la cuenta bancaria con el ID proporcionado.',
      });
    }
    const updatedAccount = await conduitFinancial.updateBankAccount(id, updatePayload);
    return res.status(200).json({
      success: true,
      message: 'Cuenta bancaria actualizada correctamente',
      data: updatedAccount,
    });
  } catch (error: any) {
    console.error('Error al actualizar cuenta bancaria:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar cuenta bancaria',
      error: error.message || error,
    });
  }
};
