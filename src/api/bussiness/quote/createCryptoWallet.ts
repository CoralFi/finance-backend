import { Request, Response } from 'express';
import supabase from '@/db/supabase';

const isDevelopment = process.env.NODE_ENV === 'development';

interface CreateCryptoWalletDepositBody {
  conduit_id: string;
  wallet_address: string;
  payment_method_id?: string;
  counterparty_id?: string;
  amount: string;
  currency: string;
  transaction_id?: string;
  metadata?: Record<string, any>;
}

const ensureValidAmount = (value?: string): number => {
  const parsed = Number(value);
  if (!value || Number.isNaN(parsed) || parsed <= 0) {
    throw new Error('INVALID_AMOUNT');
  }
  return parsed;
};

export const createCryptoWalletQuoteController = async (
  req: Request<unknown, unknown, CreateCryptoWalletDepositBody>,
  res: Response
): Promise<Response> => {
  try {
    const {
      conduit_id,
      wallet_address,
      payment_method_id,
      counterparty_id,
      amount,
      currency,
      transaction_id,
      metadata,
    } = req.body || {};

    if (!conduit_id || !wallet_address || !amount || !currency) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: conduit_id, wallet_address, amount, currency',
      });
    }

    if (!payment_method_id && !counterparty_id) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere payment_method_id o counterparty_id',
      });
    }

    const amountValue = ensureValidAmount(amount);
    const normalizedCurrency = currency.trim().toUpperCase();

    const insertPayload = {
      conduit_id: conduit_id.trim(),
      wallet_address: wallet_address.trim(),
      payment_method_id: payment_method_id || null,
      counterparty_id: counterparty_id || null,
      amount: amountValue,
      currency: normalizedCurrency,
      transaction_id: transaction_id?.trim() || null,
      metadata: metadata || null,
    };

    const { data, error } = await supabase
      .from('conduit_crypto_wallet_deposits')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          message: 'El conduit_id ya existe, no se puede duplicar',
        });
      }

      throw error;
    }

    if (isDevelopment) {
      console.log('Depósito crypto registrado localmente:', data?.id);
    }

    return res.status(201).json({
      success: true,
      message: 'Registro de depósito crypto creado correctamente',
      data,
    });
  } catch (error: any) {
    if (error.message === 'INVALID_AMOUNT') {
      return res.status(400).json({
        success: false,
        message: 'El campo amount debe ser un número positivo',
      });
    }

    console.error('Error al registrar depósito crypto:', error);

    return res.status(error.status || 500).json({
      success: false,
      message: 'Error al registrar depósito crypto',
      error: error.message || error,
    });
  }
};
