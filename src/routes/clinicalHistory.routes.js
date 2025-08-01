import { Router } from "express";
import {
  getClinicalHistories,
  getClinicalHistoryById,
  getClinicalHistoriesByPatient,
  createClinicalHistory,
  updateClinicalHistory,
  deleteClinicalHistory,
} from "../controllers/clinicalHistory.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Clinical History
 *   description: Gestión de historiales clínicos
 */

/**
 * @swagger
 * /clinical-history:
 *   post:
 *     summary: Crear un nuevo historial clínico
 *     tags: [Clinical History]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patient_id
 *               - observation
 *             properties:
 *               patient_id:
 *                 type: integer
 *                 description: ID del paciente
 *               observation:
 *                 type: string
 *                 description: Observación clínica
 *     responses:
 *       201:
 *         description: Historial clínico creado exitosamente
 *       401:
 *         description: Token inválido o expirado
 *       404:
 *         description: Paciente no encontrado
 *       500:
 *         description: Error del servidor
 */
router.post('/clinical-history/', createClinicalHistory);

/**
 * @swagger
 * /clinical-history:
 *   get:
 *     summary: Obtener todos los historiales clínicos del tenant
 *     tags: [Clinical History]
 *     responses:
 *       200:
 *         description: Lista de historiales clínicos
 *       401:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error del servidor
 */
router.get('/clinical-history/', getClinicalHistories);

/**
 * @swagger
 * /clinical-history/patient/{patient_id}:
 *   get:
 *     summary: Obtener historiales clínicos de un paciente específico
 *     tags: [Clinical History]
 *     parameters:
 *       - name: patient_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del paciente
 *     responses:
 *       200:
 *         description: Historiales clínicos del paciente
 *       401:
 *         description: Token inválido o expirado
 *       404:
 *         description: Paciente no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/clinical-history/patient/:patient_id', getClinicalHistoriesByPatient);

/**
 * @swagger
 * /clinical-history/{id}:
 *   get:
 *     summary: Obtener un historial clínico por ID
 *     tags: [Clinical History]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del historial clínico
 *     responses:
 *       200:
 *         description: Datos del historial clínico
 *       401:
 *         description: Token inválido o expirado
 *       404:
 *         description: Historial clínico no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/clinical-history/:id', getClinicalHistoryById);

/**
 * @swagger
 * /clinical-history/{id}:
 *   put:
 *     summary: Actualizar un historial clínico por ID
 *     tags: [Clinical History]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del historial clínico
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - observation
 *             properties:
 *               observation:
 *                 type: string
 *                 description: Nueva observación clínica
 *     responses:
 *       200:
 *         description: Historial clínico actualizado
 *       401:
 *         description: Token inválido o expirado
 *       404:
 *         description: Historial clínico no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/clinical-history/:id', updateClinicalHistory);

/**
 * @swagger
 * /clinical-history/{id}:
 *   delete:
 *     summary: Eliminar un historial clínico por ID
 *     tags: [Clinical History]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del historial clínico
 *     responses:
 *       200:
 *         description: Historial clínico eliminado exitosamente
 *       401:
 *         description: Token inválido o expirado
 *       404:
 *         description: Historial clínico no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/clinical-history/:id', deleteClinicalHistory);

export default router; 