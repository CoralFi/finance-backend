import { Request, Response } from 'express';
import crossmintApi from '@/services/crossmint/crossmint';

export const createWallet = async (req: Request, res: Response) => {
  try {
    const { chainType, email } = req.body;
    const wallet = await crossmintApi.createWallet(chainType, email);
    res.json(wallet);
  } catch (error: any) {
    console.error('Error creando wallet:', error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
};