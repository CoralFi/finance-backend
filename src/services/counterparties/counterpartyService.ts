// =====================================================
// Counterparties Service
// =====================================================
// Servicio para gestionar counterparties en Supabase
// =====================================================

import supabase from '@/db/supabase';
import { PaymentMethodService } from '@/services/paymentMethods/paymentMethodService';
import { PaymentMethodResponse } from '@/types/payment-methods';
import {
  CounterpartyDB,
  CounterpartyResponse,
  CounterpartyFilters,
  IndividualCounterpartyResponse,
  BusinessCounterpartyResponse,
  InsertCounterpartyData,
} from '@/types/counterparties';

export class CounterpartyService {
  private static readonly TABLE_NAME = 'conduit_counterparties';

  /**
   * Guarda un counterparty en Supabase
   */
  static async saveCounterparty(
    counterpartyData: CounterpartyResponse
  ): Promise<CounterpartyDB> {
    try {
      const dbRecord = this.mapResponseToDB(counterpartyData);

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert(dbRecord)
        .select()
        .single();

      if (error) {
        console.error('Error saving counterparty to Supabase:', error);
        throw new Error(`Failed to save counterparty: ${error.message}`);
      }
      if (counterpartyData.paymentMethods && counterpartyData.paymentMethods.length > 0) {
        for (const pm of counterpartyData.paymentMethods) {
          await PaymentMethodService.savePaymentMethod(
            pm as unknown as PaymentMethodResponse,
            counterpartyData.customerId,
            data.counterparty_id
          );
        }
      }

      console.log('✓ Counterparty saved to Supabase:', data.counterparty_id);
      return data;
    } catch (error: any) {
      console.error('Error in saveCounterparty:', error);
      throw error;
    }
  }

  /**
   * Actualiza un counterparty existente
   */
  static async updateCounterparty(
    counterpartyId: string,
    counterpartyData: Partial<CounterpartyResponse>
  ): Promise<CounterpartyDB> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      // Actualizar campos comunes
      if (counterpartyData.status) {
        updateData.status = counterpartyData.status;
      }
      if (counterpartyData.email) {
        updateData.email = counterpartyData.email;
      }
      if (counterpartyData.phone) {
        updateData.phone = counterpartyData.phone;
      }
      if (counterpartyData.address) {
        updateData.address = counterpartyData.address;
      }
      if (counterpartyData.paymentMethods) {
        updateData.payment_method_ids = counterpartyData.paymentMethods.map(pm => pm.id);
      }
      if (counterpartyData.documents) {
        updateData.document_ids = counterpartyData.documents.map(doc => doc.documentId);
      }
      if (counterpartyData.messages) {
        updateData.messages = counterpartyData.messages;
      }

      // Actualizar campos específicos según el tipo
      if (counterpartyData.type === 'individual') {
        const individualData = counterpartyData as Partial<IndividualCounterpartyResponse>;
        if (individualData.firstName) updateData.first_name = individualData.firstName;
        if (individualData.middleName) updateData.middle_name = individualData.middleName;
        if (individualData.lastName) updateData.last_name = individualData.lastName;
        if (individualData.birthDate) updateData.birth_date = individualData.birthDate;
        if (individualData.nationality) updateData.nationality = individualData.nationality;
        if (individualData.identificationType) updateData.identification_type = individualData.identificationType;
        if (individualData.identificationNumber) updateData.identification_number = individualData.identificationNumber;
      } else if (counterpartyData.type === 'business') {
        const businessData = counterpartyData as Partial<BusinessCounterpartyResponse>;
        if (businessData.businessName) updateData.business_name = businessData.businessName;
        if (businessData.website) updateData.website = businessData.website;
        if (businessData.identificationType) updateData.identification_type = businessData.identificationType;
        if (businessData.identificationNumber) updateData.identification_number = businessData.identificationNumber;
      }

      // Actualizar timestamps de Conduit
      if (counterpartyData.updatedAt) {
        updateData.conduit_updated_at = counterpartyData.updatedAt;
      }

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .update(updateData)
        .eq('counterparty_id', counterpartyId)
        .select()
        .single();

      if (error) {
        console.error('Error updating counterparty in Supabase:', error);
        throw new Error(`Failed to update counterparty: ${error.message}`);
      }

      console.log('✓ Counterparty updated in Supabase:', counterpartyId);
      return data;
    } catch (error: any) {
      console.error('Error in updateCounterparty:', error);
      throw error;
    }
  }

  /**
   * Obtiene un counterparty por su ID de Conduit
   */
  static async getCounterpartyById(counterpartyId: string): Promise<CounterpartyDB | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('counterparty_id', counterpartyId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No se encontró el registro
          return null;
        }
        console.error('Error fetching counterparty from Supabase:', error);
        throw new Error(`Failed to fetch counterparty: ${error.message}`);
      }

      return data;
    } catch (error: any) {
      console.error('Error in getCounterpartyById:', error);
      throw error;
    }
  }

  /**
   * Lista counterparties con filtros opcionales
   */
  static async listCounterparties(filters?: CounterpartyFilters): Promise<CounterpartyDB[]> {
    try {
      let query = supabase.from(this.TABLE_NAME).select('*').eq('active', true);

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
      if (filters?.email) {
        query = query.eq('email', filters.email);
      }

      // Ordenar por fecha de creación descendente
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error listing counterparties from Supabase:', error);
        throw new Error(`Failed to list counterparties: ${error.message}`);
      }

      return data || [];
    } catch (error: any) {
      console.error('Error in listCounterparties:', error);
      throw error;
    }
  }

  /**
   * Marca un counterparty como eliminado (soft delete)
   */
  static async deleteCounterparty(counterpartyId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update({
          status: 'deleted',
          updated_at: new Date().toISOString()
        })
        .eq('counterparty_id', counterpartyId);

      if (error) {
        console.error('Error deleting counterparty in Supabase:', error);
        throw new Error(`Failed to delete counterparty: ${error.message}`);
      }

      console.log('✓ Counterparty marked as deleted:', counterpartyId);
    } catch (error: any) {
      console.error('Error in deleteCounterparty:', error);
      throw error;
    }
  }

  /**
   * Desactiva un counterparty (soft delete cambiando active a false)
   */
  static async deactivateCounterparty(counterpartyId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update({
          active: false,
          updated_at: new Date().toISOString()
        })
        .eq('counterparty_id', counterpartyId);

      if (error) {
        console.error('Error deactivating counterparty in Supabase:', error);
        throw new Error(`Failed to deactivate counterparty: ${error.message}`);
      }

      console.log('✓ Counterparty deactivated:', counterpartyId);
    } catch (error: any) {
      console.error('Error in deactivateCounterparty:', error);
      throw error;
    }
  }

  /**
   * Elimina permanentemente un counterparty
   */
  static async hardDeleteCounterparty(counterpartyId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('counterparty_id', counterpartyId);

      if (error) {
        console.error('Error hard deleting counterparty from Supabase:', error);
        throw new Error(`Failed to hard delete counterparty: ${error.message}`);
      }

      console.log('✓ Counterparty permanently deleted:', counterpartyId);
    } catch (error: any) {
      console.error('Error in hardDeleteCounterparty:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de counterparties por customer
   */
  static async getCounterpartiesStats(customerId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('counterparties_stats')
        .select('*')
        .eq('customer_id', customerId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No hay estadísticas aún
          return null;
        }
        console.error('Error fetching counterparties stats:', error);
        throw new Error(`Failed to fetch stats: ${error.message}`);
      }

      return data;
    } catch (error: any) {
      console.error('Error in getCounterpartiesStats:', error);
      throw error;
    }
  }

  /**
   * Mapea la respuesta de Conduit a formato de base de datos
   */
  private static mapResponseToDB(
    response: CounterpartyResponse
  ): InsertCounterpartyData {
    const baseRecord: InsertCounterpartyData = {
      counterparty_id: response.id,
      customer_id: response.customerId,
      type: response.type,
      status: response.status,
      email: response.email,
      phone: response.phone,
      address: response.address,
      payment_method_ids: response.paymentMethods?.map(pm => pm.id) || [],
      document_ids: response.documents?.map(doc => doc.documentId) || [],
      messages: response.messages || [],
      raw_response: response,
      conduit_created_at: response.createdAt,
      conduit_updated_at: response.updatedAt,
    };

    if (response.type === 'individual') {
      const individualResponse = response as IndividualCounterpartyResponse;
      return {
        ...baseRecord,
        first_name: individualResponse.firstName,
        middle_name: individualResponse.middleName,
        last_name: individualResponse.lastName,
        birth_date: individualResponse.birthDate,
        nationality: individualResponse.nationality,
        identification_type: individualResponse.identificationType,
        identification_number: individualResponse.identificationNumber,
      };
    } else {
      const businessResponse = response as BusinessCounterpartyResponse;
      return {
        ...baseRecord,
        business_name: businessResponse.businessName,
        website: businessResponse.website,
        identification_type: businessResponse.identificationType,
        identification_number: businessResponse.identificationNumber,
      };
    }
  }

  /**
   * Mapea el registro de base de datos a formato de respuesta
   */
  static mapDBToResponse(dbRecord: CounterpartyDB): CounterpartyResponse {
    const rawCreated = (dbRecord as any).conduit_created_at || dbRecord.created_at;
    const rawUpdated = (dbRecord as any).conduit_updated_at || dbRecord.updated_at;

    const createdAt = rawCreated
      ? typeof rawCreated === 'string'
        ? rawCreated
        : rawCreated.toISOString()
      : '';

    const updatedAt = rawUpdated
      ? typeof rawUpdated === 'string'
        ? rawUpdated
        : rawUpdated.toISOString()
      : '';

    const baseResponse = {
      id: dbRecord.counterparty_id,
      customerId: dbRecord.customer_id,
      status: dbRecord.status,
      email: dbRecord.email,
      phone: dbRecord.phone,
      address: dbRecord.address,
      paymentMethods: (dbRecord.payment_method_ids || []).map(id => ({ id, type: 'bank' as const })),
      documents: (dbRecord.document_ids || []).map(id => ({ documentId: id })),
      messages: dbRecord.messages || [],
      createdAt,
      updatedAt,
    };

    if (dbRecord.type === 'individual') {
      return {
        ...baseResponse,
        type: 'individual',
        firstName: dbRecord.first_name!,
        middleName: dbRecord.middle_name,
        lastName: dbRecord.last_name!,
        birthDate: dbRecord.birth_date
          ? typeof dbRecord.birth_date === 'string'
            ? dbRecord.birth_date
            : dbRecord.birth_date.toISOString()
          : '',
        nationality: dbRecord.nationality!,
        identificationType: dbRecord.identification_type!,
        identificationNumber: dbRecord.identification_number!,
      } as IndividualCounterpartyResponse;
    } else {
      return {
        ...baseResponse,
        type: 'business',
        businessName: dbRecord.business_name!,
        website: dbRecord.website!,
        identificationType: dbRecord.identification_type!,
        identificationNumber: dbRecord.identification_number!,
      } as BusinessCounterpartyResponse;
    }
  }
}
