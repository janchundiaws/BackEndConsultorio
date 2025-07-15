// ✅ Correcto en ESModules
import swaggerJSDoc from 'swagger-jsdoc';
import { PORT } from "./config.js";

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API - Consultorio Odontológico',
      version: '1.0.0',
      description: 'Documentación Swagger para la API del consultorio',
    },
    servers: [
      {
        url: `http://localhost:${PORT}/api`,
      },
      {
        url: `https://backendconsultorio.onrender.com/api`,
      }      
    ],    
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],    
  },
  apis: ['./src/routes/*.js'], // o ajusta según tu estructura real
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
