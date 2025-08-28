import { Router } from "express";
import {
  getClinicalHistories,
  getClinicalHistoryById,
  getClinicalHistoriesByPatient,
  createClinicalHistory,
  updateClinicalHistory,
  deleteClinicalHistory,
  // New attachment functions
  createAttachment,
  getAttachmentsByHistoryId,
  getAttachmentById,
  updateAttachment,
  deleteAttachment,
  getClinicalHistoryWithAttachments,
  getAllAttachments
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

// =====================================================
// CLINICAL HISTORY ATTACHMENTS ROUTES
// =====================================================

/**
 * @swagger
 * /clinical-history/{history_id}/attachments:
 *   post:
 *     summary: Crear un nuevo attachment para historial clínico
 *     tags: [Clinical History]
 *     parameters:
 *       - name: history_id
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
 *               - filename
 *               - base64_content
 *             properties:
 *               filename:
 *                 type: string
 *                 description: Nombre del archivo
 *               mime_type:
 *                 type: string
 *                 description: Tipo MIME del archivo
 *               base64_content:
 *                 type: string
 *                 description: Contenido del archivo en base64
 *     responses:
 *       201:
 *         description: Attachment creado exitosamente
 *       401:
 *         description: Token inválido o expirado
 *       404:
 *         description: Historial clínico no encontrado
 *       500:
 *         description: Error del servidor
 */
router.post('/clinical-history/:history_id/attachments', createAttachment);

/**
 * @swagger
 * /clinical-history/{history_id}/attachments:
 *   get:
 *     summary: Obtener todos los attachments de un historial clínico
 *     tags: [Clinical History]
 *     parameters:
 *       - name: history_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del historial clínico
 *     responses:
 *       200:
 *         description: Lista de attachments
 *       401:
 *         description: Token inválido o expirado
 *       404:
 *         description: Historial clínico no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/clinical-history/:history_id/attachments', getAttachmentsByHistoryId);

/**
 * @swagger
 * /clinical-history/attachments/{id}:
 *   get:
 *     summary: Obtener un attachment por ID
 *     tags: [Clinical History]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del attachment
 *     responses:
 *       200:
 *         description: Datos del attachment
 *       401:
 *         description: Token inválido o expirado
 *       404:
 *         description: Attachment no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/clinical-history/attachments/:id', getAttachmentById);

/**
 * @swagger
 * /clinical-history/attachments/{id}:
 *   put:
 *     summary: Actualizar un attachment por ID
 *     tags: [Clinical History]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del attachment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - filename
 *               - base64_content
 *             properties:
 *               filename:
 *                 type: string
 *                 description: Nuevo nombre del archivo
 *               mime_type:
 *                 type: string
 *                 description: Nuevo tipo MIME del archivo
 *               base64_content:
 *                 type: string
 *                 description: Nuevo contenido del archivo en base64
 *     responses:
 *       200:
 *         description: Attachment actualizado exitosamente
 *       401:
 *         description: Token inválido o expirado
 *       404:
 *         description: Attachment no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/clinical-history/attachments/:id', updateAttachment);

/**
 * @swagger
 * /clinical-history/attachments/{id}:
 *   delete:
 *     summary: Eliminar un attachment por ID
 *     tags: [Clinical History]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del attachment
 *     responses:
 *       200:
 *         description: Attachment eliminado exitosamente
 *       401:
 *         description: Token inválido o expirado
 *       404:
 *         description: Attachment no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/clinical-history/attachments/:id', deleteAttachment);

/**
 * @swagger
 * /clinical-history/{id}/with-attachments:
 *   get:
 *     summary: Obtener un historial clínico con todos sus attachments
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
 *         description: Historial clínico con attachments
 *       401:
 *         description: Token inválido o expirado
 *       404:
 *         description: Historial clínico no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/clinical-history/:id/with-attachments', getClinicalHistoryWithAttachments);

/**
 * @swagger
 * /clinical-history/attachments:
 *   get:
 *     summary: Obtener todos los attachments del tenant (función de administrador)
 *     tags: [Clinical History]
 *     responses:
 *       200:
 *         description: Lista de todos los attachments
 *       401:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error del servidor
 */
router.get('/clinical-history/attachments', getAllAttachments);

export default router; 