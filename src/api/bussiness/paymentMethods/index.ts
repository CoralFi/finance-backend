import { Router } from 'express';
import { createPaymentMethodController } from './createPaymentMethod';
import { listPaymentMethodsController } from './listPaymentMethods';
import { getPaymentMethodController } from './getPaymentMethod';
import { updatePaymentMethodController } from './updatePaymentMethod';
import { deletePaymentMethodController } from './deletePaymentMethod';
import { listWalletsAndCounterpartiesController } from './listWalletsAndCounterparties';
import { deactivateController } from './deactivate';

const paymentMethodsRouter = Router();

/**
 * @route   POST /api/business/:customerId/payment-methods
 * @desc    Crear un nuevo método de pago (bank account o wallet) para un customer
 * @access  Private
 */
paymentMethodsRouter.post(
  '/business/:customerId/payment-methods',
  createPaymentMethodController
);

/**
 * @route   GET /api/business/:customerId/payment-methods
 * @desc    Listar todos los métodos de pago de un customer
 * @access  Private
 */
paymentMethodsRouter.get(
  '/business/:customerId/payment-methods',
  listPaymentMethodsController
);

paymentMethodsRouter.get(
  '/customers/:customerId/wallets-and-counterparties',
  listWalletsAndCounterpartiesController
);

/**
 * @route   GET /api/business/:customerId/payment-methods/:paymentMethodId
 * @desc    Obtener un método de pago específico
 * @access  Private
 */
paymentMethodsRouter.get(
  '/business/:customerId/payment-methods/:paymentMethodId',
  getPaymentMethodController
);

/**
 * @route   PATCH /api/business/:customerId/payment-methods/:paymentMethodId
 * @desc    Actualizar un método de pago
 * @access  Private
 */
paymentMethodsRouter.patch(
  '/business/:customerId/payment-methods/:paymentMethodId',
  updatePaymentMethodController
);

/**
 * @route   DELETE /api/business/:customerId/payment-methods/:paymentMethodId
 * @desc    Eliminar un método de pago
 * @access  Private
 */
paymentMethodsRouter.delete(
  '/business/:customerId/payment-methods/:paymentMethodId',
  deletePaymentMethodController
);

/**
 * @route   DELETE /api/deactivate/:type/:id
 * @desc    Desactivar (soft delete) un payment method o counterparty
 * @params  type: 'payment-method' | 'counterparty', id: ID del registro
 * @access  Private
 */
paymentMethodsRouter.delete(
  '/deactivate/:type/:id',
  deactivateController
);

export default paymentMethodsRouter;

