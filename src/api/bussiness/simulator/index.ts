import { Router } from 'express';
import { simulateCustomerKYBController } from './simulateKYB';
import { changeComplianceStatusController } from './changeCompliance';

const router = Router();

/**
 * @route POST /api/business/simulator/customer-kyb
 * @desc Simulate customer KYB verification in Conduit Sandbox
 * @access Private (requires authentication)
 */
router.post('/customer-kyb', simulateCustomerKYBController);

/**
 * @route POST /api/business/simulator/compliance
 * @desc Change compliance status of customers or counterparties in Conduit Sandbox
 * @access Private (requires authentication)
 */
router.post('/compliance', changeComplianceStatusController);

export default router;
