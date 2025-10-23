import express from "express";
import apiRoutes from "./api";
import cors from "cors";
import { config } from "dotenv";
import { morganMiddleware } from "./config/morgan";
import { setupSwagger } from './config/swagger';
config();

const app = express();

app.use(express.json());
app.use("/api", apiRoutes);

// 👇 Esto permite que funcione tanto localmente como en Vercel
if (process.env.NODE_ENV === "development") {
    setupSwagger(app);
    app.use(cors());
    app.use(express.json());
    app.use(morganMiddleware);
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
} 

export default app;
