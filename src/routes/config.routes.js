import { Router } from "express";
import {
  getBloodTypes
} from "../controllers/config.controller.js";
import { verificarToken } from '../helpers/jwt.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: BloodType
 *   description: Admin BloodType
 */

/**
 * @swagger
 * /bloodType:
 *   get:
 *     summary: Obtener todos los tipos de sangre
 *     tags: [BloodType]
 *     responses:
 *       200:
 *         description: Lista de tipos de sangre
 */
router.get("/bloodType",verificarToken,  getBloodTypes);


export default router;