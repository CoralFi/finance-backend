import { Request, Response } from 'express';
import { PaymentMethodService } from '@/services/paymentMethods/paymentMethodService';
import { CounterpartyService } from '@/services/counterparties/counterpartyService';
import { PaymentMethodFilters, PaymentMethodResponse } from '@/types/payment-methods';
import {
  CounterpartyFilters,
  CounterpartyResponse,
} from '@/types/counterparties';
import { AuthRequest } from "@/middleware/authMiddleware";

type CounterpartyListItem = CounterpartyResponse & {
  kind: 'counterparty';
  paymentMethods: PaymentMethodResponse[];
};

export const listWalletsAndCounterpartiesController = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    // const { customerId } = req.params;
    const customerId = req.user?.conduit_id
    const { currency, network } = req.query as {
      currency?: string;
      network?: string;
    };

    const normalizedNetwork = network?.toLowerCase();
    const normalizedCurrency = currency?.toUpperCase();

    const CRYPTO_CURRENCIES = ['USDT', 'USDC', 'BTC', 'ETH'];
    const FIAT_CURRENCIES = ['USD', 'MXN', 'BRL', 'COP', 'EUR', 'NGN', 'ARS', 'GBP'];

    const isCryptoCurrency = normalizedCurrency
      ? CRYPTO_CURRENCIES.includes(normalizedCurrency)
      : false;
    const isFiatCurrency = normalizedCurrency ? FIAT_CURRENCIES.includes(normalizedCurrency) : false;

    // Default behavior is wallet-only for crypto use cases. Allow banks when filtering by fiat currency.
    const walletOnly = normalizedNetwork
      ? true
      : normalizedCurrency
        ? !isFiatCurrency
        : true;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID es requerido',
      });
    }

    console.log(
      `Listing wallets (sin counterparty) y counterparties para customer ${customerId} con currency=${normalizedCurrency} y network=${normalizedNetwork}`
    );

    const paymentMethodFilters: PaymentMethodFilters = {
      customerId,
      ...(walletOnly && { type: 'wallet' }),
      ...(normalizedCurrency && { currency: normalizedCurrency }),
    };

    const counterpartyFilters: CounterpartyFilters = {
      customerId,
    };

    const [paymentMethods, counterparties] = await Promise.all([
      PaymentMethodService.listPaymentMethods(paymentMethodFilters),
      CounterpartyService.listCounterparties(counterpartyFilters),
    ]);

    const methodsWithoutCounterparty = paymentMethods.filter((pm) => {
      if (pm.counterparty_id) {
        return false;
      }
      if (normalizedNetwork) {
        const railValues = Array.isArray(pm.rail) ? pm.rail : [pm.rail];
        const matchesNetwork = railValues.some((rail) => rail?.toLowerCase() === normalizedNetwork);
        if (!matchesNetwork) {
          return false;
        }
      }
      if (normalizedCurrency && pm.currency !== normalizedCurrency) {
        return false;
      }
      if (walletOnly && pm.type !== 'wallet') {
        return false;
      }
      return true;
    });

    const walletItems = methodsWithoutCounterparty.map((pm) => ({
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

    const counterpartyItems = (
      await Promise.all(
        counterparties.map(async (cp): Promise<CounterpartyListItem | null> => {
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

            paymentMethods = (methods.filter(Boolean) as PaymentMethodResponse[]).filter(
              (pm) => {
                if (walletOnly && pm.type !== 'wallet') {
                  return false;
                }
                if (normalizedCurrency && pm.currency !== normalizedCurrency) {
                  return false;
                }
                if (normalizedNetwork && pm.type === 'wallet') {
                  const railValues = Array.isArray(pm.rail) ? pm.rail : [pm.rail];
                  const matchesNetwork = railValues.some(
                    (rail) => rail?.toLowerCase() === normalizedNetwork
                  );
                  if (!matchesNetwork) {
                    return false;
                  }
                }
                return true;
              }
            );
          }

          if (paymentMethods.length === 0) {
            return null;
          }

          return {
            kind: 'counterparty' as const,
            ...baseResponse,
            paymentMethods,
          };
        })
      )
    ).filter((item): item is CounterpartyListItem => Boolean(item));

    const items: (typeof walletItems[number] | CounterpartyListItem)[] = [
      ...walletItems,
      ...counterpartyItems,
    ];

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
