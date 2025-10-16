import { Router } from "express";
import { testController } from "./test";
const router = Router();
router.get("/", testController);
export default router;
