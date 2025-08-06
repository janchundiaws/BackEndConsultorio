import express from "express";
import usersRoutes from "./routes/users.routes.js";
import patientsRoutes from "./routes/patients.routes.js";
import authRoutes from './routes/auth.routes.js';
import configRoutes from './routes/config.routes.js';
import specialtiesDentistsRoutes from './routes/specialty.routes.js';
import clinicalHistoryRoutes from './routes/clinicalHistory.routes.js';
import healthRoutes from './routes/health.routes.js';
import morgan from "morgan";
import cors from 'cors';
import { PORT } from "./config.js";
import swaggerUi from "swagger-ui-express"; // ✅ usar import
import swaggerSpec from "./swagger.js";      // ✅ asegúrate de tener este archivo

const app = express();

app.use(morgan("dev"));

app.use(cors({
    origin: '*', //solo para pruebas
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id'],
    credentials: true
  }));
app.options('*', cors()); // habilita preflight para todas las rutas

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//app.use(usersRoutes);

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// // Rutas de la API
app.use('/api', healthRoutes); // ⬅️ Rutas de health check
app.use('/api', authRoutes); // ⬅️ Rutas de autenticacion
app.use('/api', usersRoutes); // ⬅️ Rutas de gestion de los  usuarios
app.use('/api', patientsRoutes); // ⬅️ Rutas de gestion de los  pcientes
app.use('/api', configRoutes); // ⬅️ Rutas de gestion de los tipos de sangre
app.use('/api', specialtiesDentistsRoutes); // ⬅️ Rutas de gestion de los tipos de sangre
app.use('/api', clinicalHistoryRoutes); // ⬅️ Rutas de gestion de historiales clínicos



app.listen(PORT);
// eslint-disable-next-line no-console
console.log("Server on port", PORT);
