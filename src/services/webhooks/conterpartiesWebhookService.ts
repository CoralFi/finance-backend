import supabase from '@/db/supabase';
import { CounterpartyData, CounterpartyStatus } from '@/types/conduit-webhooks';

/*
 * Service to handle counterparty webhook updates in Supabase
 */
export class ConterpartiesWebhookService {
  private static readonly TABLE_NAME = 'conduit_counterparties';

  private static readonly isDevelopment = process.env.NODE_ENV === 'development';

  static async updateCounterpartyStatus(
    counterpartyId: string,
    status: CounterpartyStatus,
    counterpartyData: CounterpartyData
  ): Promise<void> {
    try {
      if (this.isDevelopment) {
        console.log(`📝 Updating counterparty ${counterpartyId} to status: ${status}`);
      }

      const { data: existingCounterparty } = await supabase
        .from(this.TABLE_NAME)
        .select('status, updated_at')
        .eq('counterparty_id', counterpartyId)
        .single();

      if (!existingCounterparty) {
        console.warn(`⚠️ Counterparty ${counterpartyId} not found in database, skipping status update`);
        return;
      }

      const statusPriority: Record<CounterpartyStatus, number> = {
        active: 3,
        in_compliance_review: 1,
        compliance_rejected: 4,
        deleted: 5,
      };

      const currentPriority = statusPriority[existingCounterparty.status as CounterpartyStatus] || 0;
      const newPriority = statusPriority[status] || 0;

      if (currentPriority >= newPriority) {
        console.log(
          `⚠️ Skipping update: Counterparty ${counterpartyId} already at ${existingCounterparty.status} (priority ${currentPriority}), not downgrading to ${status} (priority ${newPriority})`
        );
        return;
      }

      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
        conduit_updated_at: counterpartyData.updatedAt,
        raw_response: counterpartyData,
      };

      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update(updateData)
        .eq('counterparty_id', counterpartyId);

      if (error) {
        throw error;
      }

      if (this.isDevelopment) {
        console.log(
          `✅ Counterparty ${counterpartyId} updated from ${existingCounterparty.status} to ${status}`
        );
      }
    } catch (error) {
      console.error(`❌ Error updating counterparty ${counterpartyId}:`, error);
      throw error;
    }
  }

  static async logWebhookEvent(
    eventType: string,
    counterpartyId: string,
    payload: any,
    idempotencyKey?: string
  ): Promise<void> {
    try {
      if (idempotencyKey) {
        const { data: existingLog } = await supabase
          .from('webhook_counterparty_logs')
          .select('id')
          .eq('idempotency_key', idempotencyKey)
          .single();

        if (existingLog) {
          console.log(`⚠️ Counterparty webhook already processed: ${idempotencyKey}`);
          return;
        }
      }

      const { error } = await supabase.from('webhook_counterparty_logs').insert({
        event_type: eventType,
        counterparty_id: counterpartyId,
        payload,
        idempotency_key: idempotencyKey || null,
        processed_at: new Date().toISOString(),
      });

      if (error) {
        console.error('❌ Error logging counterparty webhook event:', error);
      }
    } catch (error) {
      console.error('❌ Error in logWebhookEvent for counterparties:', error);
    }
  }

  static async getCounterpartyHistory(counterpartyId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('webhook_counterparty_logs')
        .select('*')
        .eq('counterparty_id', counterpartyId)
        .order('processed_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error(
        `❌ Error getting counterparty history for ${counterpartyId}:`,
        error
      );
      throw error;
    }
  }
}