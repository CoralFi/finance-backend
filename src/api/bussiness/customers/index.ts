import { Router } from "express";
import { getAllCustomersController } from "./getAllCustomers";
import { getCustomerByIdController } from "./getCustomerById"
const router = Router();
router.get("/", getAllCustomersController);
router.get("/:id", getCustomerByIdController);
export default router;
