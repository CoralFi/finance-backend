import { Request, Response } from 'express';
import { PaymentMethodService } from '@/services/paymentMethods/paymentMethodService';
import { CounterpartyService } from '@/services/counterparties/counterpartyService';
import conduitFinancial from '@/services/conduit/conduit-financial';
/**
 * Controller para desactivar (soft delete) un payment method o counterparty
 * Cambia la columna 'active' a false en lugar de eliminar el registro
 */
export const deactivateController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { type } = req.params; // 'payment-method' o 'counterparty'
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                error: 'ID es requerido',
            });
        }

        if (!type || (type !== 'payment-method' && type !== 'counterparty')) {
            return res.status(400).json({
                success: false,
                error: 'Tipo debe ser "payment-method" o "counterparty"',
            });
        }

        if (type === 'payment-method') {
            // Verificar que existe
            const paymentMethod = await PaymentMethodService.getPaymentMethodById(id);
            if (!paymentMethod) {
                return res.status(404).json({
                    success: false,
                    error: 'Payment method no encontrado',
                });
            }

            await PaymentMethodService.deactivatePaymentMethod(id);

            console.log(`✓ Payment method desactivado: ${id}`);

            return res.status(200).json({
                success: true,
                message: 'Payment method desactivado exitosamente',
                id,
            });
        } else {
            // Verificar que existe
            const counterparty = await CounterpartyService.getCounterpartyById(id);
            if (!counterparty) {
                return res.status(404).json({
                    success: false,
                    error: 'Counterparty no encontrado',
                });
            }

            // Desactivar el counterparty
            await CounterpartyService.deactivateCounterparty(id);

            // También desactivar todos los payment methods asociados
            if (counterparty.payment_method_ids && counterparty.payment_method_ids.length > 0) {
                for (const pmId of counterparty.payment_method_ids) {
                    await PaymentMethodService.deactivatePaymentMethod(pmId);
                }
                console.log(`✓ ${counterparty.payment_method_ids.length} payment methods asociados desactivados`);
            }

            await conduitFinancial.deleteCounterparty(id);
            console.log(`✓ Counterparty desactivado: ${id}`);
            return res.status(200).json({
                success: true,
                message: 'Counterparty y sus payment methods desactivados exitosamente',
                id,
                deactivatedPaymentMethods: counterparty.payment_method_ids?.length || 0,
            });
        }
    } catch (error: any) {
        console.error('Error al desactivar:', error);

        return res.status(500).json({
            success: false,
            error: 'Error interno al desactivar el registro',
            details: { message: error.message },
        });
    }
};
