import { Router } from "express";
import {
  createAppointment,
  getAppointments,
  getAppointmentsByPatient,
  getAppointmentsByDentist,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAppointmentStats
} from "../controllers/appointments.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Gestión de citas médicas
 */

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Crear una nueva cita
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patient_id
 *               - dentist_id
 *               - office_id
 *               - appointment_time
 *             properties:
 *               patient_id:
 *                 type: integer
 *                 description: ID del paciente
 *               dentist_id:
 *                 type: integer
 *                 description: ID del dentista
 *               office_id:
 *                 type: integer
 *                 description: ID de la oficina/consultorio
 *               appointment_time:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora de la cita
 *               reason:
 *                 type: string
 *                 description: Motivo de la cita
 *     responses:
 *       201:
 *         description: Cita creada exitosamente
 *       401:
 *         description: Token inválido o expirado
 *       404:
 *         description: Paciente, dentista u oficina no encontrado
 *       409:
 *         description: Conflicto de horario con el dentista
 *       500:
 *         description: Error del servidor
 */
router.post('/appointments/', createAppointment);

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Obtener todas las citas con filtros opcionales
 *     tags: [Appointments]
 *     parameters:
 *       - name: patient_id
 *         in: query
 *         schema:
 *           type: integer
 *         description: Filtrar por ID del paciente
 *       - name: dentist_id
 *         in: query
 *         schema:
 *           type: integer
 *         description: Filtrar por ID del dentista
 *       - name: office_id
 *         in: query
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de la oficina
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [pending, completed, cancelled]
 *         description: Filtrar por estado de la cita
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
 *         description: Lista de citas con información de paginación
 *       401:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error del servidor
 */
router.get('/appointments/', getAppointments);

/**
 * @swagger
 * /appointments/patient/{patient_id}:
 *   get:
 *     summary: Obtener citas de un paciente específico
 *     tags: [Appointments]
 *     parameters:
 *       - name: patient_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del paciente
 *     responses:
 *       200:
 *         description: Citas del paciente
 *       401:
 *         description: Token inválido o expirado
 *       404:
 *         description: Paciente no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/appointments/patient/:patient_id', getAppointmentsByPatient);

/**
 * @swagger
 * /appointments/dentist/{dentist_id}:
 *   get:
 *     summary: Obtener citas de un dentista específico
 *     tags: [Appointments]
 *     parameters:
 *       - name: dentist_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del dentista
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
 *         description: Citas del dentista
 *       401:
 *         description: Token inválido o expirado
 *       404:
 *         description: Dentista no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/appointments/dentist/:dentist_id', getAppointmentsByDentist);

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     summary: Obtener una cita por ID
 *     tags: [Appointments]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cita
 *     responses:
 *       200:
 *         description: Datos de la cita
 *       401:
 *         description: Token inválido o expirado
 *       404:
 *         description: Cita no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/appointments/:id', getAppointmentById);

/**
 * @swagger
 * /appointments/{id}:
 *   put:
 *     summary: Actualizar una cita por ID
 *     tags: [Appointments]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cita
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patient_id:
 *                 type: integer
 *                 description: ID del paciente
 *               dentist_id:
 *                 type: integer
 *                 description: ID del dentista
 *               office_id:
 *                 type: integer
 *                 description: ID de la oficina/consultorio
 *               appointment_time:
 *                 type: string
 *                 format: date-time
 *                 description: Nueva fecha y hora de la cita
 *               status:
 *                 type: string
 *                 enum: [pending, completed, cancelled]
 *                 description: Estado de la cita
 *               reason:
 *                 type: string
 *                 description: Motivo de la cita
 *     responses:
 *       200:
 *         description: Cita actualizada exitosamente
 *       401:
 *         description: Token inválido o expirado
 *       404:
 *         description: Cita, paciente, dentista u oficina no encontrado
 *       409:
 *         description: Conflicto de horario con el dentista
 *       500:
 *         description: Error del servidor
 */
router.put('/appointments/:id', updateAppointment);

/**
 * @swagger
 * /appointments/{id}:
 *   delete:
 *     summary: Eliminar una cita por ID
 *     tags: [Appointments]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cita
 *     responses:
 *       200:
 *         description: Cita eliminada exitosamente
 *       401:
 *         description: Token inválido o expirado
 *       404:
 *         description: Cita no encontrada
 *       400:
 *         description: No se puede eliminar una cita completada
 *       500:
 *         description: Error del servidor
 */
router.delete('/appointments/:id', deleteAppointment);

/**
 * @swagger
 * /appointments/stats/summary:
 *   get:
 *     summary: Obtener estadísticas de citas
 *     tags: [Appointments]
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
 *         description: Estadísticas de citas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_appointments:
 *                   type: integer
 *                   description: Total de citas
 *                 pending_appointments:
 *                   type: integer
 *                   description: Citas pendientes
 *                 completed_appointments:
 *                   type: integer
 *                   description: Citas completadas
 *                 cancelled_appointments:
 *                   type: integer
 *                   description: Citas canceladas
 *                 today_appointments:
 *                   type: integer
 *                   description: Citas de hoy
 *                 tomorrow_appointments:
 *                   type: integer
 *                   description: Citas de mañana
 *       401:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error del servidor
 */
router.get('/appointments/stats/summary', getAppointmentStats);

export default router;