import { Router } from "express";
import {
    getSpecialtyDentists
} from "../controllers/specialty.controller.js";
import { verificarToken } from '../helpers/jwt.js';

const router = Router();



/**
 * @swagger
 * tags:
 *   name: Transacction
 *   description: Transacciones de todos los procesos
 */

/**
 * @swagger
 * /specialtyDentists:
 *   get:
 *     summary: Obtener todos dentistas con sus  especialidades
 *     tags: [Transacction]
 *     responses:
 *       200:
 *         description: Lista de los dentistas y sus especialidades
 */
router.get("/specialtyDentists",verificarToken,  getSpecialtyDentists);

export default router;