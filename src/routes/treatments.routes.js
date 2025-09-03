import { Router } from "express";
import {
  createTreatment,
  getTreatments,
  getTreatmentsByAppointment,
  getTreatmentById,
  updateTreatment,
  deleteTreatment,
  getTreatmentStats,
  markTreatmentCompleted,
  getTreatmentsByPatient
} from "../controllers/treatments.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Treatments
 *   description: Gestión de tratamientos médicos
 */

/**
 * @swagger
 * /treatments:
 *   post:
 *     summary: Crear un nuevo tratamiento
 *     tags: [Treatments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointment_id
 *               - description
 *             properties:
 *               appointment_id:
 *                 type: integer
 *                 description: ID de la cita asociada
 *               description:
 *                 type: string
 *                 description: Descripción del tratamiento
 *               cost:
 *                 type: number
 *                 format: decimal
 *                 description: Costo del tratamiento
 *               completed:
 *                 type: boolean
 *                 default: false
 *                 description: Estado de completado del tratamiento
 *     responses:
 *       201:
 *         description: Tratamiento creado exitosamente
 *       401:
 *         description: Token inválido o expirado
 *       404:
 *         description: Appointment no encontrado
 *       500:
 *         description: Error del servidor
 */
router.post('/treatments/', createTreatment);

/**
 * @swagger
 * /treatments:
 *   get:
 *     summary: Obtener todos los tratamientos con filtros opcionales
 *     tags: [Treatments]
 *     parameters:
 *       - name: appointment_id
 *         in: query
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de la cita
 *       - name: completed
 *         in: query
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado de completado
 *       - name: cost_min
 *         in: query
 *         schema:
 *           type: number
 *           format: decimal
 *         description: Costo mínimo
 *       - name: cost_max
 *         in: query
 *         schema:
 *           type: number
 *           format: decimal
 *         description: Costo máximo
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Cantidad de resultados por página
 *     responses:
 *       200:
 *         description: Lista de tratamientos con información de paginación
 *       401:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error del servidor
 */
router.get('/treatments/', getTreatments);

/**
 * @swagger
 * /treatments/appointment/{appointment_id}:
 *   get:
 *     summary: Obtener tratamientos de una cita específica
 *     tags: [Treatments]
 *     parameters:
 *       - name: appointment_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cita
 *     responses:
 *       200:
 *         description: Tratamientos de la cita
 *       401:
 *         description: Token inválido o expirado
 *       404:
 *         description: Appointment no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/treatments/appointment/:appointment_id', getTreatmentsByAppointment);

/**
 * @swagger
 * /treatments/patient/{patient_id}:
 *   get:
 *     summary: Obtener tratamientos de un paciente específico
 *     tags: [Treatments]
 *     parameters:
 *       - name: patient_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del paciente
 *       - name: completed
 *         in: query
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado de completado
 *       - name: date_from
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar desde esta fecha
 *       - name: date_to
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar hasta esta fecha
 *     responses:
 *       200:
 *         description: Tratamientos del paciente
 *       401:
 *         description: Token inválido o expirado
 *       404:
 *         description: Paciente no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/treatments/patient/:patient_id', getTreatmentsByPatient);

/**
 * @swagger
 * /treatments/{id}:
 *   get:
 *     summary: Obtener un tratamiento por ID
 *     tags: [Treatments]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tratamiento
 *     responses:
 *       200:
 *         description: Datos del tratamiento
 *       401:
 *         description: Token inválido o expirado
 *       404:
 *         description: Tratamiento no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/treatments/:id', getTreatmentById);

/**
 * @swagger
 * /treatments/{id}:
 *   put:
 *     summary: Actualizar un tratamiento por ID
 *     tags: [Treatments]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tratamiento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appointment_id:
 *                 type: integer
 *                 description: ID de la cita asociada
 *               description:
 *                 type: string
 *                 description: Nueva descripción del tratamiento
 *               cost:
 *                 type: number
 *                 format: decimal
 *                 description: Nuevo costo del tratamiento
 *               completed:
 *                 type: boolean
 *                 description: Estado de completado del tratamiento
 *     responses:
 *       200:
 *         description: Tratamiento actualizado exitosamente
 *       401:
 *         description: Token inválido o expirado
 *       404:
 *         description: Tratamiento o appointment no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/treatments/:id', updateTreatment);

/**
 * @swagger
 * /treatments/{id}:
 *   delete:
 *     summary: Eliminar un tratamiento por ID
 *     tags: [Treatments]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tratamiento
 *     responses:
 *       200:
 *         description: Tratamiento eliminado exitosamente
 *       401:
 *         description: Token inválido o expirado
 *       404:
 *         description: Tratamiento no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/treatments/:id', deleteTreatment);

/**
 * @swagger
 * /treatments/{id}/complete:
 *   patch:
 *     summary: Marcar un tratamiento como completado
 *     tags: [Treatments]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tratamiento
 *     responses:
 *       200:
 *         description: Tratamiento marcado como completado
 *       401:
 *         description: Token inválido o expirado
 *       404:
 *         description: Tratamiento no encontrado
 *       400:
 *         description: El tratamiento ya está completado
 *       500:
 *         description: Error del servidor
 */
router.patch('/treatments/:id/complete', markTreatmentCompleted);

/**
 * @swagger
 * /treatments/stats/summary:
 *   get:
 *     summary: Obtener estadísticas de tratamientos
 *     tags: [Treatments]
 *     parameters:
 *       - name: date_from
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar estadísticas desde esta fecha
 *       - name: date_to
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar estadísticas hasta esta fecha
 *     responses:
 *       200:
 *         description: Estadísticas de tratamientos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_treatments:
 *                   type: integer
 *                   description: Total de tratamientos
 *                 completed_treatments:
 *                   type: integer
 *                   description: Tratamientos completados
 *                 pending_treatments:
 *                   type: integer
 *                   description: Tratamientos pendientes
 *                 total_revenue:
 *                   type: number
 *                   format: decimal
 *                   description: Ingresos totales
 *                 average_cost:
 *                   type: number
 *                   format: decimal
 *                   description: Costo promedio
 *                 completed_revenue:
 *                   type: number
 *                   format: decimal
 *                   description: Ingresos de tratamientos completados
 *       401:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error del servidor
 */
router.get('/treatments/stats/summary', getTreatmentStats);

export default router;