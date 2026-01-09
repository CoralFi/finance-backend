import { Request, Response } from 'express';
import conduitFinancial from '@/services/conduit/conduit-financial';
import supabase from '@/db/supabase';
import { filterBalance } from '../bussiness/balances/helpers/filterBalance';
const isDevelopment = process.env.NODE_ENV === 'development';

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
  conduit_id?: string;
  /** Spread en basis points (1 bps = 0.01%). Ejemplo: 50 = 0.5%, 100 = 1% */
  spreadBps?: number;
}

export const createQuoteControllerConduit = async (
  req: Request<unknown, unknown, CreateQuoteBody>,
  res: Response
): Promise<Response> => {
  try {
    const body = req.body;
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

    if (isSourceCrypto) {
      if (!body.conduit_id) {
        return res.status(400).json({
          success: false,
          message: "Falta conduit_id"
        });
      }

      const balances = await filterBalance(body.conduit_id);
      const network = body.source.network
      if (!network) {
        return res.status(400).json({
          success: false,
          message: "Falta conduit_id"
        });
      }
      const netKey = network.toUpperCase();
      const assetKey = body.source.asset.toUpperCase();
      const amount = body.source.amount;

      if (!balances[netKey]) {
        return res.status(400).json({
          error: `No hay balances para la red ${network}`
        });
      }

      // Validar que exista el asset en esa red
      if (!balances[netKey][assetKey]) {
        return res.status(400).json({
          error: `No hay balance para el asset ${assetKey} en la red ${network}`
        });
      }

      // Validar que el monto sea suficiente
      const available = balances[netKey][assetKey];
      if (parseFloat(amount) > available) {
        return res.status(400).json({
          error: `Fondos insuficientes: tienes ${available} ${assetKey}, intentas usar ${amount}`
        });
      }
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

    // Build payload with optional pricing overrides
    const payload: Record<string, any> = { source, target };

    // If spreadBps is provided, add pricing overrides for customer revenue
    if (body.spreadBps !== undefined && body.spreadBps !== null) {
      // Validate spreadBps range (0 to 10000 = 0% to 100%)
      if (body.spreadBps < 0 || body.spreadBps > 10000) {
        return res.status(400).json({
          success: false,
          message: 'spreadBps debe estar entre 0 y 10000 (0% a 100%)',
        });
      }

      payload.pricing = {
        overrides: {
          customer: {
            pricingModel: 'spread_on_rate',
            spreadBps: body.spreadBps,
          },
        },
      };
    }

    const data = await conduitFinancial.createQuote(payload);

    if (isDevelopment) {
      console.log('Cotización creada en Conduit:', data);
    }

    // Extract pricing data from response
    const customerPricing = data.pricing?.customer;
    const calculatedRevenue = customerPricing?.calculatedRevenue;

    // Save quote in database with pricing information
    const { data: savedQuote, error: saveError } = await supabase
      .from('conduit_quotes')
      .insert({
        quote_id: data.id,
        conduit_id: body.conduit_id || null,
        source_asset: data.source.asset,
        source_amount: data.source.amount,
        target_asset: data.target.asset,
        target_network: data.target.network || null,
        target_amount: data.target.amount,
        expires_at: data.expiresAt,
        conduit_created_at: data.createdAt,
        raw_response: data,
        // New pricing columns
        spread_bps: customerPricing?.spreadBps || null,
        pricing_model: customerPricing?.pricingModel || null,
        calculated_revenue_amount: calculatedRevenue?.amount || null,
        calculated_revenue_asset: calculatedRevenue?.asset || null,
      })
      .select('id, quote_id, created_at')
      .single();

    if (isDevelopment) {
      console.log('Cotización guardada en BD:', savedQuote);
    }

    if (saveError) {
      console.error('Error al guardar cotización:', saveError);
      // Don't throw - we still want to return the quote even if DB save fails
    }

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
