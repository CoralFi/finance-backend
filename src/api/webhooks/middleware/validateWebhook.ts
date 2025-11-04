import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Middleware to validate incoming webhook requests from Conduit
 * Verifies the HMAC signature to ensure the request is authentic
 */
export const validateConduitWebhook = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Extract signature and timestamp headers from the request
    const signature = req.headers['conduit-signature'] as string;
    const timestamp = req.headers['conduit-signature-timestamp'] as string;

    // Reject request if headers are missing
    if (!signature || !timestamp) {
      console.error('❌ Missing signature headers');
      res.status(401).json({ error: 'Missing signature headers' });
      return;
    }

    // Get webhook secret from environment variables
    const secret = process.env.CONDUIT_WEBHOOK_SECRET;
    if (!secret) {
      console.error('❌ Webhook secret is not configured');
      res.status(500).json({ error: 'Server configuration error' });
      return;
    }

    // Convert request body to string for signing
    const payload = JSON.stringify(req.body);

    // Create the string to sign: "<timestamp>.<payload>"
    const stringToSign = `${timestamp}.${payload}`;

    // Compute HMAC SHA256 hash using the secret
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(stringToSign)
      .digest('hex');

    // Compare expected signature with the one sent by Conduit
    if (expectedSignature !== signature) {
      console.error('❌ Invalid signature');
      console.error('Expected:', expectedSignature);
      console.error('Received:', signature);
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }

    // Optional: Check timestamp to prevent replay attacks (5 minutes tolerance)
    const currentTime = Math.floor(Date.now() / 1000);
    const requestTime = parseInt(timestamp, 10);
    const timeDifference = Math.abs(currentTime - requestTime);

    if (timeDifference > 300) { // 5 minutes
      console.error('❌ Webhook timestamp too old or too far in the future');
      res.status(401).json({ error: 'Invalid timestamp' });
      return;
    }

    // Signature verified — proceed to next middleware or route handler
    console.log('✅ Webhook signature verified');
    next();
  } catch (error) {
    console.error('❌ Webhook validation error:', error);
    res.status(401).json({ error: 'Webhook validation failed' });
  }
};
