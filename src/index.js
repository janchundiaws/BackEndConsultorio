import express from "express";
import usersRoutes from "./routes/users.routes.js";
import authRoutes from './routes/auth.routes.js';
import morgan from "morgan";
import { PORT } from "./config.js";
import swaggerUi from "swagger-ui-express"; // ✅ usar import
import swaggerSpec from "./swagger.js";      // ✅ asegúrate de tener este archivo

const app = express();

app.use(morgan("dev"));

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//app.use(usersRoutes);

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// // Rutas de la API
app.use('/api', authRoutes); // ⬅️ Rutas de autenticacion
app.use('/api', usersRoutes); // ⬅️ Rutas de gestion de los  usuarios



app.listen(PORT);
// eslint-disable-next-line no-console
console.log("Server on port", PORT);
