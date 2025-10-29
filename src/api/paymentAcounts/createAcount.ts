import { Request, Response } from "express";
import supabase from "../../db/supabase";
import { createFernPaymentAccount } from "@/services/fern/fernServices";
import {
  validateBasicData,
  validateCommonFields,
} from "./helpers/paymentAccountValidators";
import {
  validateCurrencyFields,
  buildExternalBankAccount,
} from "./helpers/bankAccounts";
import {
  PaymentAccountRequestBody,
  PaymentAccountType,
  BankAccountPayload,
  ExternalWalletPayload,
  WalletPayload,
} from "../../types/paymentAccounts.types";

export const createPaymentAccountController = async (
  req: Request<{}, any, PaymentAccountRequestBody>,
  res: Response
): Promise<Response> => {
  const { paymentAccountType } = req.body;

  switch (paymentAccountType as PaymentAccountType) {
    case "BANK_ACCOUNT": {
      let transaction;
      try {
        transaction = await supabase.rpc("begin");
        const data = req.body as BankAccountPayload;

        const currency = validateBasicData(data);
        validateCommonFields(data.externalBankAccount);
        validateCurrencyFields(currency, data.externalBankAccount);

        const externalBankAccount = buildExternalBankAccount(currency, data);

        const accountData = {
          paymentAccountType: "EXTERNAL_BANK_ACCOUNT",
          customerId: data.customerId,
          nickname: data.nickname || `Cuenta bancaria externa ${currency}`,
          organizationId: data.organizationId,
          isThirdParty: true,
          externalBankAccount,
        };

        const apiResponse = await createFernPaymentAccount(accountData);
        if (!apiResponse.success && apiResponse.error) {
          await supabase.rpc("rollback");
          return res.status(apiResponse.error.status || 500).json({
            success: false,
            error: "Error al crear cuenta bancaria externa",
            message: apiResponse.error.data?.message || apiResponse.error.message,
            code: apiResponse.error.code,
            details: apiResponse.error.details,
            fullError: apiResponse.error.data
          });
        }
        await supabase.rpc("commit");
        return res.status(200).json({
          success: true,
          message: `Cuenta bancaria ${currency} creada exitosamente`,
          data: apiResponse.data,
        });
      } catch (error: any) {
        if (transaction) await supabase.rpc("rollback");

        return res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    }

    case "EXTERNAL_WALLET": {
      try {
        const { customerId, cryptoWalletType, nickname, chain, address } =
          req.body as ExternalWalletPayload;

        if (!customerId || !cryptoWalletType || !nickname || !chain || !address) {
          return res.status(400).json({
            error: "Faltan campos obligatorios",
          });
        }

        const walletData = {
          paymentAccountType: "EXTERNAL_CRYPTO_WALLET",
          customerId,
          nickname,
          externalCryptoWallet: {
            cryptoWalletType,
            chain,
            address,
          },
          isThirdParty: true,
        };

        const response = await createFernPaymentAccount(walletData);
        if (!response) {
          return res.status(500).json({
            error: "Error al crear billetera externa",
          });
        }
        return res.status(200).json(response.data);
      } catch (error: any) {
        return res.status(500).json({
          error: "Error al crear billetera externa",
          details: error.message,
        });
      }
    }

    case "WALLET": {
      try {
        const { customerId, cryptoWalletType = "EVM" } =
          req.body as WalletPayload;

        const walletData = {
          paymentAccountType: "FERN_CRYPTO_WALLET",
          customerId,
          fernCryptoWallet: { cryptoWalletType },
        };

        const response = await createFernPaymentAccount(walletData);
        if (!response) {
          return res.status(500).json({
            error: "Error al crear billetera externa",
          });
        }
        return res.status(200).json(response.data);
      } catch (error: any) {
        return res.status(500).json({
          error: "Error al crear billetera Fern",
          details: error.message,
        });
      }
    }

    default:
      return res.status(404).json({
        message: `Tipo de cuenta no válido: ${paymentAccountType}`,
      });
  }
};
