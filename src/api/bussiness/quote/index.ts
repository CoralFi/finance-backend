import { Router } from 'express';
import { createCryptoWalletQuoteController } from './createCryptoWallet';

const quoteRouter = Router();

/**
 * @route POST /api/business/quote/crypto-wallet
 * @desc  Create a Conduit quote for crypto flows (wallet <> fiat)
 * @access Private
 */
quoteRouter.post('/crypto-wallet', createCryptoWalletQuoteController);

export default quoteRouter;
