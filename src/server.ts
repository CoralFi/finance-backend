import express from "express";
import apiRoutes from "./api";
import cors from "cors";
import { config } from "dotenv";
import { morganMiddleware } from "./config/morgan";
import { setupSwagger } from './config/swagger';
config();

const app = express();

// 👇 CORS debe estar ANTES de las rutas
if (process.env.NODE_ENV === "development") {
    app.use(cors({
        origin: ['http://localhost:5500', 'http://localhost:3001'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));
    app.use(morganMiddleware);
}

app.use(express.json());
app.use("/api", apiRoutes);

// 👇 Esto permite que funcione tanto localmente como en Vercel
if (process.env.NODE_ENV === "development") {
    setupSwagger(app);
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('Swagger UI en http://localhost:3000/api-docs');
  });
} 

export default app;
