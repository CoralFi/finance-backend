import { Request, Response } from 'express';
import {
  ConduitWebhookPayload,
  TransactionWebhookPayload,
  CounterpartyWebhookPayload,
  CustomerWebhookPayload,
} from '@/types/conduit-webhooks';
import { TransactionWebhookService } from '@/services/webhooks/transactionWebhookService';
import { ConterpartiesWebhookService } from '@/services/webhooks/conterpartiesWebhookService';

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Main webhook handler for all Conduit events
 * POST /api/webhooks/conduit
 */
export const handleConduitWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload: ConduitWebhookPayload = req.body;
    const idempotencyKey = req.headers['conduit-webhook-idempotency-key'] as string | undefined;

    if (isDevelopment) {
      console.log('📨 Received Conduit webhook:', {
        event: payload.event,
        version: payload.version,
        idempotencyKey,
      });
    }

    // Route to appropriate handler based on event type
    if (payload.event.startsWith('transaction.')) {
      await handleTransactionEvent(payload as TransactionWebhookPayload, idempotencyKey);
    } else if (payload.event.startsWith('counterparty.')) {
      await handleCounterpartyEvent(payload as CounterpartyWebhookPayload, idempotencyKey);
    } else if (payload.event.startsWith('customer.')) {
      await handleCustomerEvent(payload as CustomerWebhookPayload, idempotencyKey);
    } else {
      console.warn(`⚠️ Unknown event type: ${payload.event}`);
    }

    // Always respond with 200 to acknowledge receipt
    res.status(200).json({ message: 'Webhook received' });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    // Still return 200 to prevent retries for processing errors
    res.status(200).json({ message: 'Webhook received with errors' });
  }
};

/**
 * Handle transaction-related webhook events
 */
async function handleTransactionEvent(
  payload: TransactionWebhookPayload,
  idempotencyKey?: string
): Promise<void> {
  try {
    const { event, data } = payload;
    const transaction = data.transaction;

    if (isDevelopment) {
      console.log(`📊 Processing transaction event: ${event}`, {
        transactionId: transaction.id,
        status: transaction.status,
        type: transaction.type,
      });
    }

    // Log the webhook event
    await TransactionWebhookService.logWebhookEvent(
      event,
      transaction.id,
      payload,
      idempotencyKey
    );

    // Update transaction status in database
    await TransactionWebhookService.updateTransactionStatus(
      transaction.id,
      transaction.status,
      transaction
    );

    // Handle specific events
    switch (event) {
      case 'transaction.completed':
        console.log(`✅ Transaction ${transaction.id} completed`);
        // You can add additional logic here, like sending notifications
        break;

      case 'transaction.compliance_rejected':
        console.log(`❌ Transaction ${transaction.id} rejected by compliance`);
        // Handle compliance rejection
        break;

      case 'transaction.cancelled':
        console.log(`🚫 Transaction ${transaction.id} cancelled`);
        // Handle cancellation
        break;

      case 'transaction.in_compliance_review':
        console.log(`🔍 Transaction ${transaction.id} in compliance review`);
        // Handle compliance review
        break;

      case 'transaction.awaiting_funds':
        console.log(`⏳ Transaction ${transaction.id} awaiting funds`);
        // Handle awaiting funds
        break;

      case 'transaction.funds_received':
        console.log(`💰 Transaction ${transaction.id} funds received`);
        // Handle funds received
        break;

      default:
        if (isDevelopment) {
          console.log(`📝 Transaction ${transaction.id} status: ${event}`);
        }
    }
  } catch (error) {
    console.error('❌ Error handling transaction event:', error);
    throw error;
  }
}

/**
 * Handle counterparty-related webhook events
 */
async function handleCounterpartyEvent(
  payload: CounterpartyWebhookPayload,
  idempotencyKey?: string
): Promise<void> {
  try {
    const { event, data } = payload;
    const counterparty = data.counterparty;

    if (isDevelopment) {
      console.log(`🏢 Processing counterparty event: ${event}`, {
        counterpartyId: counterparty.id,
        status: counterparty.status,
      });
    }

    await ConterpartiesWebhookService.logWebhookEvent(
      event,
      counterparty.id,
      payload,
      idempotencyKey
    );

    await ConterpartiesWebhookService.updateCounterpartyStatus(
      counterparty.id,
      counterparty.status as any,
      counterparty
    );

    switch (event) {
      case 'counterparty.active':
        console.log(`✅ Counterparty ${counterparty.id} is now active`);
        break;

      case 'counterparty.compliance_rejected':
        console.log(`❌ Counterparty ${counterparty.id} rejected by compliance`);
        break;

      case 'counterparty.in_compliance_review':
        console.log(`🔍 Counterparty ${counterparty.id} in compliance review`);
        break;

      case 'counterparty.deleted':
        console.log(`🗑️ Counterparty ${counterparty.id} deleted`);
        break;

      default:
        if (isDevelopment) {
          console.log(`📝 Counterparty ${counterparty.id} event: ${event}`);
        }
    }
  } catch (error) {
    console.error('❌ Error handling counterparty event:', error);
    throw error;
  }
}

/**
 * Handle customer-related webhook events
 */
async function handleCustomerEvent(
  payload: CustomerWebhookPayload,
  idempotencyKey?: string
): Promise<void> {
  try {
    const { event, data } = payload;
    const customer = data.customer;

    if (isDevelopment) {
      console.log(`👤 Processing customer event: ${event}`, {
        customerId: customer.id,
        status: customer.status,
      });
    }

    // Add your customer event handling logic here
    // For example, update customer status in database

    switch (event) {
      case 'customer.created':
        console.log(`✅ Customer ${customer.id} created`);
        break;

      case 'customer.active':
        console.log(`✅ Customer ${customer.id} is now active`);
        break;

      case 'customer.in_compliance_review':
        console.log(`🔍 Customer ${customer.id} in compliance review`);
        break;

      case 'customer.compliance_rejected':
        console.log(`❌ Customer ${customer.id} rejected by compliance`);
        break;

      case 'customer.kyb_in_progress':
        console.log(`📝 Customer ${customer.id} KYB in progress`);
        break;

      case 'customer.kyb_expired':
        console.log(`⏰ Customer ${customer.id} KYB expired`);
        break;

      default:
        if (isDevelopment) {
          console.log(`📝 Customer ${customer.id} event: ${event}`);
        }
    }
  } catch (error) {
    console.error('❌ Error handling customer event:', error);
    throw error;
  }
}
