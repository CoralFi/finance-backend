import { Request, Response } from 'express';
import { PaymentMethodService } from '@/services/paymentMethods/paymentMethodService';
import { CounterpartyService } from '@/services/counterparties/counterpartyService';
import { PaymentMethodFilters, PaymentMethodResponse } from '@/types/payment-methods';
import { CounterpartyFilters } from '@/types/counterparties';

export const listWalletsAndCounterpartiesController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { customerId } = req.params;
    const { currency } = req.query as { currency?: string };

    if (!customerId) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID es requerido',
      });
    }

    console.log(
      `Listing wallets (sin counterparty) y counterparties para customer ${customerId} con currency=${currency}`
    );

    const paymentMethodFilters: PaymentMethodFilters = {
      customerId,
    };

    const counterpartyFilters: CounterpartyFilters = {
      customerId,
    };

    const [paymentMethods, counterparties] = await Promise.all([
      PaymentMethodService.listPaymentMethods(paymentMethodFilters),
      CounterpartyService.listCounterparties(counterpartyFilters),
    ]);

    const methodsWithoutCounterparty = paymentMethods.filter(
      (pm) => !pm.counterparty_id
    );

    const filteredMethods = methodsWithoutCounterparty.filter((pm) => {
      if (pm.type === 'wallet' && currency) {
        return pm.currency === currency;
      }
      return true;
    });

    const walletItems = filteredMethods.map((pm) => ({
      kind: 'paymentMethod' as const,
      id: pm.payment_method_id,
      customerId: pm.customer_id,
      type: pm.type,
      status: pm.status,
      currency: pm.currency,
      walletAddress: pm.wallet_address,
      walletLabel: pm.wallet_label,
      bankName: pm.bank_name,
      accountOwnerName: pm.account_owner_name,
      accountNumber: pm.account_number,
      accountType: pm.account_type,
      raw: pm,
    }));

    const counterpartyItems = await Promise.all(
      counterparties.map(async (cp) => {
        const baseResponse = CounterpartyService.mapDBToResponse(cp);

        let paymentMethods: PaymentMethodResponse[] = [];

        if (cp.payment_method_ids && cp.payment_method_ids.length > 0) {
          const methods = await Promise.all(
            cp.payment_method_ids.map(async (id) => {
              const pmDb = await PaymentMethodService.getPaymentMethodById(id);
              if (!pmDb) return null;
              return PaymentMethodService.mapDBToResponse(pmDb);
            })
          );

          paymentMethods = methods.filter(Boolean) as PaymentMethodResponse[];
        }

        return {
          kind: 'counterparty' as const,
          ...baseResponse,
          paymentMethods,
        };
      })
    );

    const items = [...walletItems, ...counterpartyItems];

    return res.status(200).json({
      success: true,
      message:
        'Wallet payment methods (sin counterparty) y counterparties obtenidos exitosamente',
      count: items.length,
      items,
    });
  } catch (error: any) {
    console.error('Error listing wallets and counterparties:', error);

    return res.status(500).json({
      success: false,
      error:
        'Error interno al obtener wallets y counterparties desde la base de datos',
      details: { message: error.message },
    });
  }
};
