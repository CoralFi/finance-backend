import supabase from '@/db/supabase';
import { TransactionData, TransactionStatus } from '@/types/conduit-webhooks';

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Service to handle transaction webhook updates in Supabase
 */
export class TransactionWebhookService {
  /**
   * Update transaction status in Supabase based on webhook data
   */
  static async updateTransactionStatus(
    transactionId: string,
    status: TransactionStatus,
    transactionData: TransactionData
  ): Promise<void> {
    try {
      if (isDevelopment) {
        console.log(`📝 Updating transaction ${transactionId} to status: ${status}`);
      }

      // First, check if transaction exists and its current state
      const { data: existingTransaction } = await supabase
        .from('conduit_transactions')
        .select('status, updated_at')
        .eq('transaction_id', transactionId)
        .single();

      if (!existingTransaction) {
        console.warn(`⚠️ Transaction ${transactionId} not found in database`);
        // Create the transaction if it doesn't exist (skipUpdate=true to avoid recursion)
        await this.createTransactionFromWebhook(transactionData, true);
        return;
      }

      // Check if we should update based on status priority (avoid race conditions)
      const statusPriority: Record<TransactionStatus, number> = {
        'CREATED': 1,
        'IN_COMPLIANCE_REVIEW': 2,
        'AWAITING_COMPLIANCE_REVIEW': 2,
        'COMPLIANCE_APPROVED': 3,
        'COMPLIANCE_REJECTED': 10, // Final state
        'AWAITING_FUNDS': 4,
        'FUNDS_RECEIVED': 5,
        'PROCESSING_WITHDRAWAL': 6,
        'WITHDRAWAL_PROCESSED': 7,
        'PROCESSING_SETTLEMENT': 8,
        'SETTLEMENT_PROCESSED': 9,
        'PROCESSING_PAYMENT': 8,
        'PAYMENT_PROCESSED': 9,
        'COMPLETED': 10, // Final state
        'CANCELLED': 10, // Final state
      };

      const currentPriority = statusPriority[existingTransaction.status] || 0;
      const newPriority = statusPriority[status] || 0;

      // Don't downgrade from a final state or higher priority state
      if (currentPriority >= newPriority && currentPriority >= 10) {
        console.log(`⚠️ Skipping update: Transaction ${transactionId} is already in final state ${existingTransaction.status}`);
        return;
      }

      // Prepare update data
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      // Add completed_at timestamp if transaction is completed
      if (status === 'COMPLETED' && transactionData.completedAt) {
        updateData.completed_at = transactionData.completedAt;
      }

      // Update the transaction in the database
      const { data, error } = await supabase
        .from('conduit_transactions')
        .update(updateData)
        .eq('transaction_id', transactionId)
        .select();

      if (error) {
        throw error;
      }

      if (isDevelopment) {
        console.log(`✅ Transaction ${transactionId} updated from ${existingTransaction.status} to ${status}`);
      }
    } catch (error) {
      console.error(`❌ Error updating transaction ${transactionId}:`, error);
      throw error;
    }
  }

  /**
   * Update transaction status only (without creating if not found)
   * Used internally to avoid infinite recursion
   */
  private static async updateTransactionStatusOnly(
    transactionId: string,
    status: TransactionStatus,
    transactionData: TransactionData
  ): Promise<void> {
    try {
      // First, check current transaction state to avoid race conditions
      const { data: existingTransaction } = await supabase
        .from('conduit_transactions')
        .select('status, updated_at, conduit_created_at')
        .eq('transaction_id', transactionId)
        .single();

      if (existingTransaction) {
        // Don't update if the existing status is more "final" than the new one
        const statusPriority: Record<TransactionStatus, number> = {
          'CREATED': 1,
          'IN_COMPLIANCE_REVIEW': 2,
          'AWAITING_COMPLIANCE_REVIEW': 2,
          'COMPLIANCE_APPROVED': 3,
          'COMPLIANCE_REJECTED': 10, // Final state
          'AWAITING_FUNDS': 4,
          'FUNDS_RECEIVED': 5,
          'PROCESSING_WITHDRAWAL': 6,
          'WITHDRAWAL_PROCESSED': 7,
          'PROCESSING_SETTLEMENT': 8,
          'SETTLEMENT_PROCESSED': 9,
          'PROCESSING_PAYMENT': 8,
          'PAYMENT_PROCESSED': 9,
          'COMPLETED': 10, // Final state
          'CANCELLED': 10, // Final state
        };

        const currentPriority = statusPriority[existingTransaction.status] || 0;
        const newPriority = statusPriority[status] || 0;

        if (currentPriority >= newPriority && currentPriority >= 10) {
          console.log(`⚠️ Skipping update: Transaction ${transactionId} is already in final state ${existingTransaction.status}`);
          return;
        }
      }

      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'COMPLETED' && transactionData.completedAt) {
        updateData.completed_at = transactionData.completedAt;
      }

      const { error } = await supabase
        .from('conduit_transactions')
        .update(updateData)
        .eq('transaction_id', transactionId);

      if (error) {
        console.error(`Error updating transaction status: ${error.message}`);
      }
    } catch (error) {
      console.error(`Error in updateTransactionStatusOnly:`, error);
    }
  }

  /**
   * Create a transaction record from webhook data if it doesn't exist
   * This handles cases where webhook arrives before the transaction is saved
   */
  static async createTransactionFromWebhook(transactionData: TransactionData, skipUpdate: boolean = false): Promise<void> {
    try {
      if (isDevelopment) {
        console.log(`📝 Creating transaction ${transactionData.id} from webhook`);
      }

      // Validate required fields
      if (!transactionData.source?.amount?.amount || !transactionData.destination?.amount?.amount) {
        throw new Error(`Missing required amount data for transaction ${transactionData.id}`);
      }

      // Get asset type from source or destination
      const sourceAsset = transactionData.source.asset || transactionData.source.amount.assetType;
      const destinationAsset = transactionData.destination.asset || transactionData.destination.amount.assetType;

      // Get network from source or destination
      const sourceNetwork = transactionData.source.network || transactionData.source.amount.assetTypeNetwork?.networkId || null;
      const destinationNetwork = transactionData.destination.network || transactionData.destination.amount.assetTypeNetwork?.networkId || null;

      if (!sourceAsset || !destinationAsset) {
        throw new Error(`Missing asset type for transaction ${transactionData.id}`);
      }

      // Extract wallet address from destination (for withdrawals/offramps) or source (for deposits/onramps)
      const walletAddress = transactionData.destination?.address || transactionData.source?.address || null;

      const { data, error } = await supabase
        .from('conduit_transactions')
        .insert({
          transaction_id: transactionData.id,
          quote_id: transactionData.quote || null,
          transaction_type: transactionData.type,
          status: transactionData.status,
          source_id: transactionData.source.id || null,
          source_asset: sourceAsset,
          source_network: sourceNetwork,
          source_amount: transactionData.source.amount.amount,
          destination_id: transactionData.destination.id || null,
          destination_asset: destinationAsset,
          destination_network: destinationNetwork,
          destination_amount: transactionData.destination.amount.amount,
          purpose: transactionData.purpose || null,
          reference: transactionData.reference || null,
          wallet_address: walletAddress,
          conduit_created_at: transactionData.createdAt,
          completed_at: transactionData.completedAt || null,
          raw_response: transactionData,
        })
        .select();

      if (error) {
        if (error.code === '23505') {
          console.log(`Transaction ${transactionData.id} already exists in database`);
          // Avoid infinite recursion: only update if skipUpdate is false
          if (!skipUpdate) {
            await this.updateTransactionStatusOnly(transactionData.id, transactionData.status, transactionData);
          }
          return;
        }
        throw error;
      }

      if (isDevelopment) {
        console.log(`✅ Transaction ${transactionData.id} created from webhook`);
      }
    } catch (error) {
      console.error(`❌ Error creating transaction ${transactionData.id} from webhook:`, error);
      throw error;
    }
  }

  /**
   * Log webhook event for audit purposes
   */
  static async logWebhookEvent(
    eventType: string,
    transactionId: string,
    payload: any,
    idempotencyKey?: string
  ): Promise<void> {
    try {
      // Check if this webhook has already been processed (idempotency)
      if (idempotencyKey) {
        const { data: existingLog } = await supabase
          .from('webhook_logs')
          .select('id')
          .eq('idempotency_key', idempotencyKey)
          .single();

        if (existingLog) {
          console.log(`⚠️ Webhook already processed: ${idempotencyKey}`);
          return;
        }
      }

      // Log the webhook event
      const { error } = await supabase
        .from('webhook_logs')
        .insert({
          event_type: eventType,
          transaction_id: transactionId,
          payload,
          idempotency_key: idempotencyKey || null,
          processed_at: new Date().toISOString(),
        });

      if (error) {
        console.error('❌ Error logging webhook event:', error);
        // Don't throw - logging failure shouldn't stop webhook processing
      }
    } catch (error) {
      console.error('❌ Error in logWebhookEvent:', error);
      // Don't throw - logging failure shouldn't stop webhook processing
    }
  }

  /**
   * Get transaction history for a specific transaction
   */
  static async getTransactionHistory(transactionId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .eq('transaction_id', transactionId)
        .order('processed_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error(`❌ Error getting transaction history for ${transactionId}:`, error);
      throw error;
    }
  }
}
