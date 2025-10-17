import { FERN_API_BASE_URL, getAuthHeaders } from "@/config/fern";
import supabase from "@/db/supabase";
import axios from "axios";

export const FernKycStatus = async (fernCustomerId: string, userId: string) => {
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


export const getFernWalletCryptoInfo = async (paymentAccountId: string) => {
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

