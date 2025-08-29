import { Router } from "express";
import {
  getBloodTypes,
  getDocumentTypes,
  getDentists,
  getOffices,
  getAppointments,
  getMaritalStatus,
  getEstadisticas
} from "../controllers/config.controller.js";
import { verificarToken } from '../helpers/jwt.js';

const router = Router();



/**
 * @swagger
 * tags:
 *   name: Master
 *   description: Admin Master
 */

/**
 * @swagger
 * /bloodType:
 *   get:
 *     summary: Obtener todos los tipos de sangre
 *     tags: [Master]
 *     responses:
 *       200:
 *         description: Lista de tipos de sangre
 */
router.get("/bloodType",verificarToken,  getBloodTypes);

/**
 * @swagger
 * /documentType:
 *   get:
 *     summary: Obtener todos los tipos de documentos
 *     tags: [Master]
 *     responses:
 *       200:
 *         description: Lista de tipos de documentos
 */
router.get("/documentType",verificarToken,  getDocumentTypes);

/**
 * @swagger
 * /dentists:
 *   get:
 *     summary: Obtener todos los Dentistas
 *     tags: [Master]
 *     responses:
 *       200:
 *         description: Lista de Dentistas
 */
router.get("/dentists",verificarToken,  getDentists);

/**
 * @swagger
 * /offices:
 *   get:
 *     summary: Obtener todos los Offices
 *     tags: [Master]
 *     responses:
 *       200:
 *         description: Lista de Offices
 */
router.get("/offices",verificarToken,  getOffices);


/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Obtener todos los Appointments
 *     tags: [Master]
 *     responses:
 *       200:
 *         description: Lista de Appointments
 */
router.get("/appointments",verificarToken,  getAppointments);

/**
 * @swagger
 * /maritalStatus:
 *   get:
 *     summary: Obtener todos los maritalStatus
 *     tags: [Master]
 *     responses:
 *       200:
 *         description: Lista de maritalStatus
 */
router.get("/maritalStatus",verificarToken,  getMaritalStatus);

/**
 * @swagger
 * /estadisticas:
 *   get:
 *     summary: Obtener todas las estadisticas
 *     tags: [Master]
 *     responses:
 *       200:
 *         description: Lista de estadisticas
 *     security:
 *       - bearerAuth: []
 */
router.get("/estadisticas",verificarToken,  getEstadisticas);

export default router;