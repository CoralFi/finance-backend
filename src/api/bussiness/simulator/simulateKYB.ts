import { Request, Response } from 'express';
import conduitFinancial from '../../../services/conduit/conduit-financial';

/**
 * Controller to simulate customer KYB verification in Conduit Sandbox
 * @route POST /api/business/simulator/customer-kyb
 */
export const simulateCustomerKYBController = async (req: Request, res: Response) => {
  try {
    const { customerId, countryCode } = req.body;

    // Validate required fields
    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'Field "customerId" is required',
      });
    }

    if (!countryCode) {
      return res.status(400).json({
        success: false,
        message: 'Field "countryCode" is required',
      });
    }

    // Validate country code format (ISO 3166-1 alpha-3)
    if (!/^[A-Z]{3}$/.test(countryCode)) {
      return res.status(400).json({
        success: false,
        message: 'Field "countryCode" must be a valid ISO 3166-1 alpha-3 code (e.g., USA, MEX, CAN)',
      });
    }

    // Log in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Simulating customer KYB:', { customerId, countryCode });
    }

    // Call Conduit API to simulate KYB
    const result = await conduitFinancial.simulateCustomerKYB(customerId, countryCode);

    // Log success in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Customer KYB simulated successfully:', result);
    }

    return res.status(200).json({
      success: true,
      message: 'Customer KYB simulated successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Error simulating customer KYB:', error);

    // Handle Conduit API errors
    if (error.response) {
      return res.status(error.response.status || 500).json({
        success: false,
        message: 'Failed to simulate customer KYB in Conduit',
        error: error.response.data || error.message,
      });
    }

    // Handle other errors
    return res.status(500).json({
      success: false,
      message: 'Internal server error while simulating customer KYB',
      error: error.message,
    });
  }
};
