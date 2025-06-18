// ✅ Correcto en ESModules
import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API del Consultorio Odontológico',
      version: '1.0.0',
      description: 'Documentación Swagger para la API del consultorio',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
      },
    ],
  },
  apis: ['./src/routes/*.js'], // o ajusta según tu estructura real
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
