import express from "express";
import apiRoutes from "./api";
import cors from "cors";
import { config } from "dotenv";
import { morganMiddleware } from "./config/morgan";
import { setupSwagger } from './config/swagger';
config();

const app = express();

// 👇 CORS debe estar ANTES de las rutas
const getAllowedOrigins = () => {
    if (process.env.ALLOWED_ORIGINS) {
        // Si existe la variable de entorno, usarla (separada por comas)
        return process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
    }
    
    // Fallback según el entorno
    if (process.env.NODE_ENV === "development") {
        return ['http://localhost:5500', 'http://localhost:3001'];
    }
    
    // Staging y producción
    return [
        'https://staging.app.coralfinance.io',
        'https://app.coralfinance.io',
        'https://www.coralfinance.io'
    ];
};

const allowedOrigins = getAllowedOrigins();

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Key']
}));

if (process.env.NODE_ENV === "development") {
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
