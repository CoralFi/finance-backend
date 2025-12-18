/**
 * Test script for Conduit Webhooks
 * This file contains utilities to test webhook functionality
 */

import crypto from 'crypto';

/**
 * Generate a valid Conduit webhook signature for testing
 */
export function generateWebhookSignature(
  payload: any,
  secret: string,
  timestamp?: number
): { signature: string; timestamp: string } {
  const ts = timestamp || Math.floor(Date.now() / 1000);
  const payloadString = JSON.stringify(payload);
  const stringToSign = `${ts}.${payloadString}`;

  const signature = crypto
    .createHmac('sha256', secret)
    .update(stringToSign)
    .digest('hex');

  return {
    signature,
    timestamp: ts.toString(),
  };
}

/**
 * Sample webhook payloads for testing
 */
export const sampleWebhooks = {
  transactionCompleted: {
    event: 'transaction.completed',
    version: '1.0',
    data: {
      transaction: {
        type: 'deposit',
        id: 'trxn_test_completed_123',
        status: 'COMPLETED',
        source: {
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          amount: {
            assetType: 'USDC',
            decimals: 6,
            standardDecimals: 6,
            amount: '1000000000',
            assetTypeNetwork: {
              assetType: 'USDC',
              networkId: 'ethereum:goerli',
            },
          },
        },
        destination: {
          id: 'acct_test123',
          amount: {
            assetType: 'USDC',
            decimals: 6,
            standardDecimals: 6,
            amount: '1000000000',
            assetTypeNetwork: {
              assetType: 'USDC',
              networkId: 'ethereum:goerli',
            },
          },
        },
        purpose: null,
        reference: null,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        clientId: 'client_test123',
      },
    },
  },

  transactionCreated: {
    event: 'transaction.created',
    version: '1.0',
    data: {
      transaction: {
        type: 'onramp',
        id: 'trxn_test_created_456',
        status: 'CREATED',
        quote: 'quote_test123',
        source: {
          id: 'bank_test123',
          amount: {
            assetType: 'USD',
            decimals: 2,
            standardDecimals: 2,
            amount: '10000',
          },
          asset: 'USD',
        },
        destination: {
          id: 'acct_test456',
          amount: {
            assetType: 'USDC',
            decimals: 6,
            standardDecimals: 6,
            amount: '10000000',
          },
          asset: 'USDC',
          network: 'ethereum',
        },
        purpose: 'Investment',
        reference: 'TEST-REF-001',
        createdAt: new Date().toISOString(),
        completedAt: null,
        clientId: 'client_test123',
      },
    },
  },

  transactionAwaitingFunds: {
    event: 'transaction.awaiting_funds',
    version: '1.0',
    data: {
      transaction: {
        type: 'onramp',
        id: 'trxn_test_awaiting_789',
        status: 'AWAITING_FUNDS',
        quote: 'quote_test456',
        source: {
          id: 'bank_test456',
          amount: {
            assetType: 'USD',
            decimals: 2,
            standardDecimals: 2,
            amount: '50000',
          },
          asset: 'USD',
        },
        destination: {
          id: 'acct_test789',
          amount: {
            assetType: 'USDC',
            decimals: 6,
            standardDecimals: 6,
            amount: '50000000',
          },
          asset: 'USDC',
          network: 'ethereum',
        },
        purpose: 'BusinessExpenses',
        reference: 'TEST-REF-002',
        createdAt: new Date().toISOString(),
        completedAt: null,
        clientId: 'client_test123',
      },
    },
  },

  transactionComplianceRejected: {
    event: 'transaction.compliance_rejected',
    version: '1.0',
    data: {
      transaction: {
        type: 'withdrawal',
        id: 'trxn_test_rejected_999',
        status: 'COMPLIANCE_REJECTED',
        source: {
          id: 'acct_test999',
          amount: {
            assetType: 'USDC',
            decimals: 6,
            standardDecimals: 6,
            amount: '100000000',
          },
          asset: 'USDC',
        },
        destination: {
          address: '0x123456789abcdef',
          amount: {
            assetType: 'USDC',
            decimals: 6,
            standardDecimals: 6,
            amount: '100000000',
          },
          asset: 'USDC',
          network: 'ethereum',
        },
        purpose: null,
        reference: null,
        createdAt: new Date().toISOString(),
        completedAt: null,
        clientId: 'client_test123',
      },
    },
  },

  customerCreated: {
    event: 'customer.created',
    version: '1.0',
    data: {
      customer: {
        id: 'cus_test123',
        type: 'business',
        businessLegalName: 'Test Company LLC',
        businessTradeName: 'Test Co',
        industry: 'Technology',
        email: 'test@example.com',
        phone: '+1234567890',
        website: 'https://testcompany.com',
        status: 'created',
        organizationId: 'org_test123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
    },
  },
};

/**
 * Example usage:
 * 
 * import { generateWebhookSignature, sampleWebhooks } from './webhookTest';
 * 
 * const secret = process.env.CONDUIT_WEBHOOK_SECRET!;
 * const payload = sampleWebhooks.transactionCompleted;
 * const { signature, timestamp } = generateWebhookSignature(payload, secret);
 * 
 * // Use signature and timestamp in your test request headers
 */
