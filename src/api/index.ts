import { Router } from "express";
import testRoutes from "./test/index";

const router = Router();

router.use("/test", testRoutes);

export default router;
