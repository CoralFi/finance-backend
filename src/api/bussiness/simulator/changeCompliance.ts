import { Request, Response } from 'express';
import conduitFinancial from '../../../services/conduit/conduit-financial';

// Valid status values for customers
const VALID_CUSTOMER_STATUSES = [
  'active',
  'in_compliance_review',
  'compliance_rejected',
  'created',
  'kyb_in_progress',
  'kyb_expired',
  'kyb_missing_information',
  'account_onboarding_pending',
];

// Valid status values for counterparties
const VALID_COUNTERPARTY_STATUSES = [
  'active',
  'deleted',
  'in_compliance_review',
  'compliance_rejected',
];

/**
 * Controller to change compliance status of customers or counterparties in Conduit Sandbox
 * @route POST /api/business/simulator/compliance
 */
export const changeComplianceStatusController = async (req: Request, res: Response) => {
  try {
    const { type, id, status } = req.body;

    // Validate required fields
    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Field "type" is required',
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Field "id" is required',
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Field "status" is required',
      });
    }

    // Validate type
    if (type !== 'customer' && type !== 'counterparty') {
      return res.status(400).json({
        success: false,
        message: 'Field "type" must be either "customer" or "counterparty"',
      });
    }

    // Validate status based on type
    if (type === 'customer' && !VALID_CUSTOMER_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid customer status. Valid values are: ${VALID_CUSTOMER_STATUSES.join(', ')}`,
      });
    }

    if (type === 'counterparty' && !VALID_COUNTERPARTY_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid counterparty status. Valid values are: ${VALID_COUNTERPARTY_STATUSES.join(', ')}`,
      });
    }

    // Log in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Changing compliance status:', { type, id, status });
    }

    // Call Conduit API to change compliance status
    const result = await conduitFinancial.changeComplianceStatus(type, id, status);

    // Log success in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Compliance status changed successfully:', result);
    }

    return res.status(200).json({
      success: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} compliance status changed successfully`,
      data: {
        type,
        id,
        status,
        ...result,
      },
    });
  } catch (error: any) {
    console.error('Error changing compliance status:', error);

    // Handle Conduit API errors
    if (error.response) {
      return res.status(error.response.status || 500).json({
        success: false,
        message: 'Failed to change compliance status in Conduit',
        error: error.response.data || error.message,
      });
    }

    // Handle other errors
    return res.status(500).json({
      success: false,
      message: 'Internal server error while changing compliance status',
      error: error.message,
    });
  }
};
