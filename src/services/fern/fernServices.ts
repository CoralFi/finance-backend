import { FERN_API_BASE_URL, getAuthHeaders } from "@/config/fern/config";
import supabase from "@/db/supabase";
import axios from "axios";
import { PaymentAccount } from "@/services/types/fern.types";
import { DeleteResponse } from "@/services/types/request.types";

export const FernKycStatus = async (fernCustomerId: any, userId: any) => {
  try {
    const response = await axios.get(
      `${FERN_API_BASE_URL}/customers/${fernCustomerId}`,
      { headers: getAuthHeaders() }
    );
    const fernData = response.data;
    const kycStatus = fernData.customerStatus === "ACTIVE" ? "APPROVED" : fernData.customerStatus;
    const kycLink = fernData.kycLink || fernData.kyc?.kycLink || null;

    const { data: existing, error: fetchError } = await supabase
      .from('fern')
      .select('*')
      .eq('user_id', userId)
      .single();


    let upsertData = {
      user_id: userId,
      fernCustomerId,
      Kyc: kycStatus,
      KycLink: kycLink
    };

    let dbResult;
    if (existing) {
      const { data, error } = await supabase
        .from('fern')
        .update(upsertData)
        .eq('user_id', userId)
        .select();
      dbResult = { data, error };
    } else {
      const { data, error } = await supabase
        .from('fern')
        .insert(upsertData)
        .select();
      dbResult = { data, error };
    }


    return {
      fern: fernData,
      kycStatus,
      kycLink
    };
  } catch (error: any) {
    console.error("Error en FernKycStatus:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      customerId: fernCustomerId,
      userId: userId
    });

    return {
      kycStatus: null,
      kycLink: null,
      error: {
        message: error.response?.data?.message || error.message,
        status: error.response?.status || 'unknown'
      }
    };
  }
}


export const getFernWalletCryptoInfo = async (paymentAccountId: any) => {
  try {
    if (!paymentAccountId) {
      throw new Error('Payment account ID is required');
    }

    const response = await fetch(`${FERN_API_BASE_URL}/payment-accounts/${paymentAccountId}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error fetching Fern payment account:', {
      paymentAccountId,
      error: error.message,
      status: error.response?.status || 'unknown',
      data: error.response?.data
    });

    return null;
  }
};

export const createFernPaymentAccount = async (payload: any) => {
  try {
    const response = await axios.post(
      `${FERN_API_BASE_URL}/payment-accounts`,
      payload,
      {
        headers: getAuthHeaders(),
        timeout: 10000
      }
    );
    return response;
  } catch (error: any) {
    console.error('Error en createFernPaymentAccount', {
      error: error.message,
      status: error.response?.status || 'unknown',
      data: error.response?.data
    });

    return null;
  }
}

export const listFernBankAccounts = async (
  customerId: string,
  currency?: string,
  type?: string,
  chain?: string
): Promise<PaymentAccount[]> => {
  try {
    if (!customerId) {
      throw new Error("El parámetro 'customerId' es obligatorio.");
    }
    const response = await fetch(
      `${FERN_API_BASE_URL}/payment-accounts?customerId=${customerId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: response.statusText,
      }));

      const error = new Error("Error al listar las cuentas desde Fern") as any;
      error.status = response.status;
      error.details = errorData;
      throw error;
    }

    const data = await response.json();
    let accounts: PaymentAccount[] = data.paymentAccounts || [];

    if (type) {
      switch (type.toUpperCase()) {
        case "FERN":
          accounts = accounts.filter(
            (acc) => acc.paymentAccountType === "FERN_CRYPTO_WALLET"
          );
          break;

        case "THIRD_PARTY":
          accounts = accounts.filter((acc) => acc.isThirdParty === true);
          break;

        case "EXTERNAL_WALLET":
          if (!chain) {
            throw new Error(
              "El parámetro 'chain' es requerido para filtrar billeteras externas."
            );
          }
          accounts = accounts.filter(
            (acc) =>
              acc.paymentAccountType === "EXTERNAL_CRYPTO_WALLET" &&
              acc.externalCryptoWallet?.chain === chain
          );
          break;

        default:
          console.warn(`Tipo de cuenta desconocido: ${type}`);
          break;
      }
    }

    if (currency) {
      accounts = accounts.filter(
        (acc) =>
          acc.externalBankAccount?.bankAccountCurrency === currency ||
          acc.externalBankAccount?.bankAccountCurrency ===
          (acc.externalBankAccount?.bankAccountCurrency as any)?.label
      );
    }

    accounts = accounts.map((acc) => {
      if (
        acc.externalBankAccount &&
        typeof acc.externalBankAccount.bankAccountCurrency === "object"
      ) {
        acc.externalBankAccount.bankAccountCurrency =
          (acc.externalBankAccount.bankAccountCurrency as { label: string })
            .label;
      }
      return acc;
    });

    return accounts;
  } catch (error: any) {
    console.error(
      "Error al listar cuentas bancarias:",
      error.message || error,
      error.stack
    );
    throw error;
  }
};



export const handleDeleteBankAccount = async (
  paymentAccountId: string
): Promise<DeleteResponse> => {
  if (!paymentAccountId) {
    throw new Error("El parámetro 'paymentAccountId' es obligatorio.");
  }

  const url = `${FERN_API_BASE_URL}/payment-accounts/${paymentAccountId}`;
  const headers = {
    ...getAuthHeaders(),
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers,
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: response.statusText }));

      const error = new Error(
        `Error al eliminar la cuenta bancaria en Fern (status: ${response.status})`
      ) as any;
      error.status = response.status;
      error.details = errorData;
      throw error;
    }

    if (response.status === 204 || response.status === 200) {
      return {
        success: true,
        message: "Cuenta bancaria eliminada exitosamente.",
      };
    }

    const data = await response.json().catch(() => null);
    return {
      success: true,
      message: "Cuenta bancaria eliminada con respuesta adicional.",
      ...(data && { details: data }),
    };
  } catch (error: any) {
    console.error(
      `Error al eliminar la cuenta bancaria ${paymentAccountId}:`,
      error.message
    );

    return {
      success: false,
      message: error.message || "Error al eliminar la cuenta bancaria",
      status: error.status || 500,
      details: error.details || null,
    };
  }
};

