// =====================================================
// Payment Methods Service
// =====================================================
// Servicio para gestionar métodos de pago en Supabase
// =====================================================

import supabase from '@/db/supabase';
import {
  PaymentMethodDB,
  PaymentMethodResponse,
  PaymentMethodFilters,
  BankPaymentMethodResponse,
  WalletPaymentMethodResponse,
} from '@/types/payment-methods';

export class PaymentMethodService {
  private static readonly TABLE_NAME = 'conduit_payment_methods';

  /**
   * Guarda un método de pago en Supabase
   */
  static async savePaymentMethod(
    paymentMethodData: PaymentMethodResponse,
    customerId: string,
    counterpartyId?: string
  ): Promise<PaymentMethodDB> {
    try {
      const dbRecord = this.mapResponseToDB(paymentMethodData, customerId, counterpartyId);

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert(dbRecord)
        .select()
        .single();

      if (error) {
        console.error('Error saving payment method to Supabase:', error);
        throw new Error(`Failed to save payment method: ${error.message}`);
      }

      return data;
    } catch (error: any) {
      console.error('Error in savePaymentMethod:', error);
      throw error;
    }
  }

  /**
   * Actualiza un método de pago existente
   */
  static async updatePaymentMethod(
    paymentMethodId: string,
    paymentMethodData: Partial<PaymentMethodResponse>
  ): Promise<PaymentMethodDB> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      // Actualizar campos según el tipo
      if (paymentMethodData.status) {
        updateData.status = paymentMethodData.status;
      }

      if (paymentMethodData.type === 'bank') {
        const bankData = paymentMethodData as Partial<BankPaymentMethodResponse>;
        if (bankData.bankName) updateData.bank_name = bankData.bankName;
        if (bankData.accountOwnerName) updateData.account_owner_name = bankData.accountOwnerName;
        if (bankData.accountNumber) updateData.account_number = bankData.accountNumber;
        if (bankData.accountType) updateData.account_type = bankData.accountType;
        if (bankData.routingNumber) updateData.routing_number = bankData.routingNumber;
        if (bankData.swiftCode) updateData.swift_code = bankData.swiftCode;
        if (bankData.iban) updateData.iban = bankData.iban;
        if (bankData.branchCode) updateData.branch_code = bankData.branchCode;
        if (bankData.bankCode) updateData.bank_code = bankData.bankCode;
        if (bankData.sortCode) updateData.sort_code = bankData.sortCode;
        if (bankData.pixKey) updateData.pix_key = bankData.pixKey;
        if (bankData.rail) updateData.rail = bankData.rail;
        if (bankData.currency) updateData.currency = bankData.currency;
        if (bankData.address) updateData.address = bankData.address;
      } else if (paymentMethodData.type === 'wallet') {
        const walletData = paymentMethodData as Partial<WalletPaymentMethodResponse>;
        if (walletData.walletAddress) updateData.wallet_address = walletData.walletAddress;
        if (walletData.walletLabel) updateData.wallet_label = walletData.walletLabel;
        if (walletData.rail) updateData.rail = walletData.rail;
        if (walletData.currency) updateData.currency = walletData.currency;
      }

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .update(updateData)
        .eq('payment_method_id', paymentMethodId)
        .select()
        .single();

      if (error) {
        console.error('Error updating payment method in Supabase:', error);
        throw new Error(`Failed to update payment method: ${error.message}`);
      }

      return data;
    } catch (error: any) {
      console.error('Error in updatePaymentMethod:', error);
      throw error;
    }
  }

  /**
   * Obtiene un método de pago por su ID de Conduit
   */
  static async getPaymentMethodById(paymentMethodId: string): Promise<PaymentMethodDB | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('payment_method_id', paymentMethodId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No se encontró el registro
          return null;
        }
        console.error('Error fetching payment method from Supabase:', error);
        throw new Error(`Failed to fetch payment method: ${error.message}`);
      }

      return data;
    } catch (error: any) {
      console.error('Error in getPaymentMethodById:', error);
      throw error;
    }
  }

  /**
   * Lista métodos de pago con filtros opcionales
   */
  static async listPaymentMethods(filters?: PaymentMethodFilters): Promise<PaymentMethodDB[]> {
    try {
      let query = supabase.from(this.TABLE_NAME).select('*').eq('status', 'enabled').eq('active', true);

      // Aplicar filtros
      if (filters?.customerId) {
        query = query.eq('customer_id', filters.customerId);
      }
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.currency) {
        query = query.eq('currency', filters.currency);
      }
      // Ordenar por fecha de creación descendente
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error listing payment methods from Supabase:', error);
        throw new Error(`Failed to list payment methods: ${error.message}`);
      }

      return data || [];
    } catch (error: any) {
      console.error('Error in listPaymentMethods:', error);
      throw error;
    }
  }

  /**
   * Elimina un método de pago (soft delete cambiando status a disabled)
   */
  static async disablePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update({
          status: 'disabled',
          updated_at: new Date().toISOString()
        })
        .eq('payment_method_id', paymentMethodId);

      if (error) {
        console.error('Error disabling payment method in Supabase:', error);
        throw new Error(`Failed to disable payment method: ${error.message}`);
      }
    } catch (error: any) {
      console.error('Error in disablePaymentMethod:', error);
      throw error;
    }
  }

  /**
   * Desactiva un método de pago (soft delete cambiando active a false)
   */
  static async deactivatePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update({
          active: false,
          updated_at: new Date().toISOString()
        })
        .eq('payment_method_id', paymentMethodId);

      if (error) {
        console.error('Error deactivating payment method in Supabase:', error);
        throw new Error(`Failed to deactivate payment method: ${error.message}`);
      }
    } catch (error: any) {
      console.error('Error in deactivatePaymentMethod:', error);
      throw error;
    }
  }

  /**
   * Elimina permanentemente un método de pago
   */
  static async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('payment_method_id', paymentMethodId);

      if (error) {
        console.error('Error deleting payment method from Supabase:', error);
        throw new Error(`Failed to delete payment method: ${error.message}`);
      }
    } catch (error: any) {
      console.error('Error in deletePaymentMethod:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de métodos de pago por customer
   */
  static async getPaymentMethodsStats(customerId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('payment_methods_stats')
        .select('*')
        .eq('customer_id', customerId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No hay estadísticas aún
          return null;
        }
        console.error('Error fetching payment methods stats:', error);
        throw new Error(`Failed to fetch stats: ${error.message}`);
      }

      return data;
    } catch (error: any) {
      console.error('Error in getPaymentMethodsStats:', error);
      throw error;
    }
  }

  /**
   * Mapea la respuesta de Conduit a formato de base de datos
   */
  private static mapResponseToDB(
    response: PaymentMethodResponse,
    customerId: string,
    counterpartyId?: string
  ): Partial<PaymentMethodDB> {
    const baseRecord: any = {
      payment_method_id: response.id,
      customer_id: customerId,
      counterparty_id: counterpartyId,
      type: response.type,
      status: response.status,
      entity_info: response.entity,
      conduit_created_at: response.createdAt,
      conduit_updated_at: response.updatedAt,
    };

    if (response.type === 'bank') {
      const bankResponse = response as BankPaymentMethodResponse;
      return {
        ...baseRecord,
        bank_name: bankResponse.bankName,
        account_owner_name: bankResponse.accountOwnerName,
        account_number: bankResponse.accountNumber,
        account_type: bankResponse.accountType,
        routing_number: bankResponse.routingNumber,
        swift_code: bankResponse.swiftCode,
        iban: bankResponse.iban,
        branch_code: bankResponse.branchCode,
        bank_code: bankResponse.bankCode,
        sort_code: bankResponse.sortCode,
        pix_key: bankResponse.pixKey,
        rail: bankResponse.rail,
        currency: bankResponse.currency,
        address: bankResponse.address,
      };
    } else {
      const walletResponse = response as WalletPaymentMethodResponse;
      return {
        ...baseRecord,
        wallet_address: walletResponse.walletAddress,
        wallet_label: walletResponse.walletLabel,
        rail: walletResponse.rail,
        currency: walletResponse.currency,
      };
    }
  }

  /**
   * Mapea el registro de base de datos a formato de respuesta
   */
  static mapDBToResponse(dbRecord: PaymentMethodDB): PaymentMethodResponse {
    const rawCreated = (dbRecord as any).conduit_created_at || dbRecord.created_at;
    const rawUpdated = (dbRecord as any).conduit_updated_at || dbRecord.updated_at;

    const createdAt = rawCreated
      ? typeof rawCreated === 'string'
        ? rawCreated
        : rawCreated.toISOString()
      : undefined;

    const updatedAt = rawUpdated
      ? typeof rawUpdated === 'string'
        ? rawUpdated
        : rawUpdated.toISOString()
      : undefined;

    if (dbRecord.type === 'bank') {
      return {
        id: dbRecord.payment_method_id,
        type: 'bank',
        rail: dbRecord.rail as any,
        bankName: dbRecord.bank_name!,
        accountOwnerName: dbRecord.account_owner_name!,
        accountNumber: dbRecord.account_number!,
        accountType: dbRecord.account_type!,
        currency: dbRecord.currency as any,
        routingNumber: dbRecord.routing_number,
        swiftCode: dbRecord.swift_code,
        iban: dbRecord.iban,
        branchCode: dbRecord.branch_code,
        bankCode: dbRecord.bank_code,
        sortCode: dbRecord.sort_code,
        pixKey: dbRecord.pix_key,
        status: dbRecord.status,
        address: dbRecord.address,
        entity: dbRecord.entity_info!,
        createdAt,
        updatedAt,
      };
    } else {
      return {
        id: dbRecord.payment_method_id,
        type: 'wallet',
        rail: dbRecord.rail as any,
        walletAddress: dbRecord.wallet_address!,
        walletLabel: dbRecord.wallet_label,
        currency: dbRecord.currency as any,
        status: dbRecord.status,
        entity: dbRecord.entity_info!,
        createdAt,
        updatedAt,
      };
    }
  }
}
