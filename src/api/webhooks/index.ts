import { Router } from 'express';
import { handleConduitWebhook } from './conduitWebhook';
import { validateConduitWebhook } from './middleware/validateWebhook';

const router = Router();

/**
 * @route POST /api/webhooks/conduit
 * @description Handle incoming webhooks from Conduit
 * @access Public (but validated with HMAC signature)
 */
router.post('/conduit', validateConduitWebhook, handleConduitWebhook);

/**
 * @route GET /api/webhooks/health
 * @description Health check endpoint for webhook service
 * @access Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'webhooks',
    timestamp: new Date().toISOString(),
  });
});

export default router;
