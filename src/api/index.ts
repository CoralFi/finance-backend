import { Router } from "express";
import testRoutes from "./test/index";
import loginRoutes from "./auth/index"
const router = Router();

router.use("/test", testRoutes);
router.use("/auth", loginRoutes);

export default router;
