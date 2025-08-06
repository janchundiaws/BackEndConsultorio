// src/routes/health.routes.js
import { Router } from 'express';
import { pool } from "../db.js";

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verificación de salud del servidor
 *     description: Endpoint especializado para verificaciones de salud del servidor. No requiere autenticación y responde rápidamente. Verifica tanto el servidor como la conexión a la base de datos.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Servidor y base de datos funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 message:
 *                   type: string
 *                   example: "Servidor funcionando correctamente"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:30:00.000Z"
 *                 uptime:
 *                   type: number
 *                   description: Tiempo de funcionamiento en segundos
 *                   example: 3600
 *                 database:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "OK"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *       503:
 *         description: Servidor funcionando pero con problemas en la base de datos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "DEGRADED"
 *                 message:
 *                   type: string
 *                   example: "Servidor funcionando pero con problemas en la base de datos"
 *                 database:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "ERROR"
 *       500:
 *         description: Error interno del servidor
 */
router.get('/health', async (req, res) => {
  try {
    // Verificar conexión a la base de datos
    let dbStatus = 'OK';
    try {
      await pool.query('SELECT 1');
    } catch (dbError) {
      dbStatus = 'ERROR';
    }

    const healthData = {
      status: dbStatus === 'OK' ? 'OK' : 'DEGRADED',
      message: dbStatus === 'OK' ? 'Servidor funcionando correctamente' : 'Servidor funcionando pero con problemas en la base de datos',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: dbStatus
      },
      version: process.env.npm_package_version || '1.0.0'
    };

    const statusCode = dbStatus === 'OK' ? 200 : 503;
    res.status(statusCode).json(healthData);
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Error interno del servidor',
      timestamp: new Date().toISOString()
    });
  }
});

export default router; 