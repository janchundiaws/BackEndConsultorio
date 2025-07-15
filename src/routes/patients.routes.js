import { Router } from "express";
import {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
} from "../controllers/patients.controller.js";
import { requireRoles } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Gestión de pacientes
 */

/**
 * @swagger
 * /patients:
 *   post:
 *     summary: Crear un nuevo paciente
 *     tags: [Patients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               document_type_id:
 *                 type: string
 *               document_id:
 *                 type: string
 *               name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               email:
 *                 type: string
 *               birth_date:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *               marital_status_id:
 *                 type: string
 *               blood_type_id:
 *                 type: string
 *               occupation:
 *                 type: string
 *     responses:
 *       201:
 *         description: Paciente creado exitosamente
 */
router.post('/patients/', createPatient);

/**
 * @swagger
 * /patients:
 *   get:
 *     summary: Obtener todos los pacientes
 *     tags: [Patients]
 *     responses:
 *       200:
 *         description: Lista de pacientes
 */
router.get('/patients/', getPatients);

/**
 * @swagger
 * /patients/{id}:
 *   get:
 *     summary: Obtener un paciente por ID
 *     tags: [Patients]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos del paciente
 */
router.get('/patients/:id', getPatientById);

/**
 * @swagger
 * /patients/{id}:
 *   put:
 *     summary: Actualizar un paciente por ID
 *     tags: [Patients]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               document_type_id:
 *                 type: string
 *               document_id:
 *                 type: string
 *               name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               email:
 *                 type: string
 *               birth_date:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *               marital_status_id:
 *                 type: string
 *               blood_type_id:
 *                 type: string
 *               occupation:
 *                 type: string
 *     responses:
 *       200:
 *         description: Paciente actualizado
 */
router.put('/patients/:id', updatePatient);

/**
 * @swagger
 * /patients/{id}:
 *   delete:
 *     summary: Eliminar un paciente por ID
 *     tags: [Patients]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paciente eliminado lógicamente
 */
router.delete('/patients/:id', deletePatient);

export default router;
