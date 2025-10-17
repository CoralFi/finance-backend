import express from "express";
import apiRoutes from "./api";
import cors from "cors";
import { config } from "dotenv";
import { morganMiddleware } from "./config/morgan";
config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morganMiddleware);
app.use("/api", apiRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`  Servidor corriendo en el puerto ${PORT}`);
});
