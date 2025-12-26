import { Router } from "express";
import { getAllCustomersController } from "./getAllCustomers";
import { getCustomerByIdController } from "./getCustomerById"
import { acceptTosController } from "./acceptTos"
const router = Router();
// /api/business/customers
router.get("/", getAllCustomersController);
// /api/business/customers/:id
router.get("/:id", getCustomerByIdController);
// /api/business/customers/accept-tos
router.post("/accept-tos", acceptTosController);
export default router;
