import express from "express";
import usersRoutes from "./routes/users.routes.js";
import patientsRoutes from "./routes/patients.routes.js";
import authRoutes from './routes/auth.routes.js';
import configRoutes from './routes/config.routes.js';
import morgan from "morgan";
import cors from 'cors';
import { PORT } from "./config.js";
import swaggerUi from "swagger-ui-express"; // ✅ usar import
import swaggerSpec from "./swagger.js";      // ✅ asegúrate de tener este archivo

const app = express();

app.use(morgan("dev"));

// Configuración básica (permitir todas las solicitudes desde cualquier origen)
// app.use(cors({
//     origin: 'http://localhost:3000', // cambia por el dominio de tu frontend
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     credentials: true
//   }));
app.options('*', cors()); // habilita preflight para todas las rutas

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//app.use(usersRoutes);

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// // Rutas de la API
app.use('/api', authRoutes); // ⬅️ Rutas de autenticacion
app.use('/api', usersRoutes); // ⬅️ Rutas de gestion de los  usuarios
app.use('/api', patientsRoutes); // ⬅️ Rutas de gestion de los  pcientes
app.use('/api', configRoutes); // ⬅️ Rutas de gestion de los tipos de sangre



app.listen(PORT);
// eslint-disable-next-line no-console
console.log("Server on port", PORT);
