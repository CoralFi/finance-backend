import { Request, Response } from 'express';
import conduitFinancial from '@/services/conduit/conduit-financial';

const FIAT_ASSETS = ['USD', 'MXN', 'BRL', 'COP', 'EUR', 'NGN', 'ARS', 'GBP'];
const CRYPTO_ASSETS = ['USDT', 'USDC', 'RLUSD'];
const NETWORKS = ['ethereum', 'tron', 'solana', 'polygon', 'base', 'xrpl'];

interface SourceData {
  amount: string;
  asset: string;
  network?: string;
}

interface TargetData {
  asset: string;
  network?: string;
}

interface CreateQuoteBody {
  source: SourceData;
  target: TargetData;
}

export const createQuoteControllerConduit = async (
  req: Request<unknown, unknown, CreateQuoteBody>,
  res: Response
): Promise<Response> => {
  try {
    const body = req.body;

    // Validaciones base
    if (!body?.source || !body?.target) {
      return res.status(400).json({
        success: false,
        message: 'Faltan los campos requeridos: source y target',
      });
    }

    const { source, target } = body;

    if (!source.amount || !source.asset) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos en source: amount y asset',
      });
    }

    const isSourceFiat = FIAT_ASSETS.includes(source.asset);
    const isSourceCrypto = CRYPTO_ASSETS.includes(source.asset);

    if (!isSourceFiat && !isSourceCrypto) {
      return res.status(400).json({
        success: false,
        message: `El asset '${source.asset}' no es válido. Opciones válidas: ${[
          ...FIAT_ASSETS,
          ...CRYPTO_ASSETS,
        ].join(', ')}`,
      });
    }

    if (isSourceCrypto && !source.network) {
      return res.status(400).json({
        success: false,
        message: `El asset ${source.asset} requiere especificar la red (network)`,
      });
    }

    if (isSourceFiat && source.network) {
      return res.status(400).json({
        success: false,
        message: `El asset ${source.asset} es fiat, no debe incluir network`,
      });
    }
    const amountValue = parseFloat(source.amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El campo source.amount debe ser un número positivo',
      });
    }

    if (!target.asset) {
      return res.status(400).json({
        success: false,
        message: 'Falta el campo target.asset',
      });
    }

    const isTargetFiat = FIAT_ASSETS.includes(target.asset);
    const isTargetCrypto = CRYPTO_ASSETS.includes(target.asset);

    if (!isTargetFiat && !isTargetCrypto) {
      return res.status(400).json({
        success: false,
        message: `El asset '${target.asset}' no es válido.`,
      });
    }

    if (isTargetCrypto && !target.network) {
      return res.status(400).json({
        success: false,
        message: `El asset ${target.asset} requiere especificar la red (network)`,
      });
    }

    if (isTargetFiat && target.network) {
      return res.status(400).json({
        success: false,
        message: `El asset ${target.asset} es fiat, no debe incluir network`,
      });
    }

    const payload = { source, target };
    const data = await conduitFinancial.createQuote(payload);

    return res.status(201).json({
      success: true,
      message: 'Cotización creada correctamente en Conduit',
      data,
    });
  } catch (error: any) {
    console.error(
      'Error al crear cotización en Conduit:',
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error al crear cotización en Conduit',
      error: error.response?.data || error.message,
    });
  }
};
