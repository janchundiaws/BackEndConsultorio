import { pool } from "../db.js";
import { decodeToken } from './../helpers/jwt.js';

// Crear un historial clínico
export const createClinicalHistory = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    const {
        patient_id,
        observation
    } = req.body;

    try {
        // Verificar que el paciente existe y pertenece al tenant
        const patientCheck = await pool.query(
            'SELECT id FROM office.patients WHERE id = $1 AND tenant_id = $2 AND status = 1',
            [patient_id, payload.tenant_id]
        );

        if (patientCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Paciente no encontrado' });
        }

        const result = await pool.query(
            `INSERT INTO office.clinical_history (
                tenant_id, patient_id, observation
            ) VALUES (
                $1, $2, $3
            ) RETURNING *`,
            [payload.tenant_id, patient_id, observation]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creando historial clínico:', error);
        res.status(500).json({ message: "Error al crear historial clínico: " + error.message });
    }
};

// Obtener todos los historiales clínicos del tenant
export const getClinicalHistories = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    try {
        const result = await pool.query(
            `SELECT ch.*, p.name as patient_name, p.last_name as patient_last_name,
                    (SELECT COUNT(*) FROM office.clinical_history_attachments 
                     WHERE history_id = ch.id AND tenant_id = ch.tenant_id) as attachments_count
             FROM office.clinical_history ch
             INNER JOIN office.patients p ON ch.patient_id = p.id
             WHERE ch.tenant_id = $1
             ORDER BY ch.created_at DESC`,
            [payload.tenant_id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error obteniendo historiales clínicos:', error);
        res.status(500).json({ message: "Error al obtener historiales clínicos" });
    }
};

// Obtener historiales clínicos por paciente
export const getClinicalHistoriesByPatient = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    const { patient_id } = req.params;

    try {
        // Verificar que el paciente existe y pertenece al tenant
        const patientCheck = await pool.query(
            'SELECT id, name, last_name FROM office.patients WHERE id = $1 AND tenant_id = $2 AND status = 1',
            [patient_id, payload.tenant_id]
        );

        if (patientCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Paciente no encontrado' });
        }

        const result = await pool.query(
            `SELECT ch.*, p.name as patient_name, p.last_name as patient_last_name,
                    (SELECT COUNT(*) FROM office.clinical_history_attachments 
                     WHERE history_id = ch.id AND tenant_id = ch.tenant_id) as attachments_count
             FROM office.clinical_history ch
             INNER JOIN office.patients p ON ch.patient_id = p.id
             WHERE ch.tenant_id = $1 AND ch.patient_id = $2
             ORDER BY ch.created_at DESC`,
            [payload.tenant_id, patient_id]
        );

        res.json({
            patient: patientCheck.rows[0],
            clinical_histories: result.rows
        });
    } catch (error) {
        console.error('Error obteniendo historiales clínicos del paciente:', error);
        res.status(500).json({ message: "Error al obtener historiales clínicos del paciente" });
    }
};

// Obtener un historial clínico por ID
export const getClinicalHistoryById = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    const { id } = req.params;

    try {
        const result = await pool.query(
            `SELECT ch.*, p.name as patient_name, p.last_name as patient_last_name 
             FROM office.clinical_history ch
             INNER JOIN office.patients p ON ch.patient_id = p.id
             WHERE ch.id = $1 AND ch.tenant_id = $2`,
            [id, payload.tenant_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Historial clínico no encontrado' });
        }

        // Obtener información básica de los attachments (sin el contenido base64)
        const attachmentsResult = await pool.query(
            'SELECT id, filename, mime_type, created_at FROM office.clinical_history_attachments WHERE history_id = $1 AND tenant_id = $2 ORDER BY created_at DESC',
            [id, payload.tenant_id]
        );

        const clinicalHistory = result.rows[0];
        clinicalHistory.attachments_count = attachmentsResult.rows.length;
        clinicalHistory.attachments = attachmentsResult.rows;

        res.json(clinicalHistory);
    } catch (error) {
        console.error('Error obteniendo historial clínico:', error);
        res.status(500).json({ message: "Error al obtener historial clínico" });
    }
};

// Actualizar un historial clínico
export const updateClinicalHistory = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    const { id } = req.params;
    const { observation } = req.body;

    try {
        // Verificar que el historial existe y pertenece al tenant
        const historyCheck = await pool.query(
            'SELECT id FROM office.clinical_history WHERE id = $1 AND tenant_id = $2',
            [id, payload.tenant_id]
        );

        if (historyCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Historial clínico no encontrado' });
        }

        const result = await pool.query(
            `UPDATE office.clinical_history 
             SET observation = $1
             WHERE id = $2 AND tenant_id = $3
             RETURNING *`,
            [observation, id, payload.tenant_id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error actualizando historial clínico:', error);
        res.status(500).json({ message: "Error al actualizar historial clínico: " + error.message });
    }
};

// Eliminar un historial clínico
export const deleteClinicalHistory = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    const { id } = req.params;

    try {
        // Verificar que el historial existe y pertenece al tenant
        const historyCheck = await pool.query(
            'SELECT id FROM office.clinical_history WHERE id = $1 AND tenant_id = $2',
            [id, payload.tenant_id]
        );

        if (historyCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Historial clínico no encontrado' });
        }

        // Eliminar el historial clínico
        await pool.query(
            'DELETE FROM office.clinical_history WHERE id = $1 AND tenant_id = $2',
            [id, payload.tenant_id]
        );

        res.json({ message: 'Historial clínico eliminado exitosamente' });
    } catch (error) {
        console.error('Error eliminando historial clínico:', error);
        res.status(500).json({ message: "Error al eliminar historial clínico: " + error.message });
    }
}; 

// =====================================================
// CLINICAL HISTORY ATTACHMENTS MANAGEMENT
// =====================================================

// Create a new attachment for clinical history
export const createAttachment = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    const { history_id } = req.params;
    const { filename, mime_type, base64_content } = req.body;

    try {
        // Verificar que el historial clínico existe y pertenece al tenant
        const historyCheck = await pool.query(
            'SELECT id FROM office.clinical_history WHERE id = $1 AND tenant_id = $2',
            [history_id, payload.tenant_id]
        );

        if (historyCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Historial clínico no encontrado' });
        }

        const result = await pool.query(
            `INSERT INTO office.clinical_history_attachments (
                tenant_id, history_id, filename, mime_type, base64_content
            ) VALUES (
                $1, $2, $3, $4, $5
            ) RETURNING *`,
            [payload.tenant_id, history_id, filename, mime_type, base64_content]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creando attachment:', error);
        res.status(500).json({ message: "Error al crear attachment: " + error.message });
    }
};

// Get all attachments for a clinical history
export const getAttachmentsByHistoryId = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    const { history_id } = req.params;

    try {
        // Verificar que el historial clínico existe y pertenece al tenant
        const historyCheck = await pool.query(
            'SELECT id FROM office.clinical_history WHERE id = $1 AND tenant_id = $2',
            [history_id, payload.tenant_id]
        );

        if (historyCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Historial clínico no encontrado' });
        }

        const result = await pool.query(
            'SELECT * FROM office.clinical_history_attachments WHERE history_id = $1 AND tenant_id = $2 ORDER BY created_at DESC',
            [history_id, payload.tenant_id]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error obteniendo attachments:', error);
        res.status(500).json({ message: "Error al obtener attachments" });
    }
};

// Get attachment by ID
export const getAttachmentById = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    const { id } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM office.clinical_history_attachments WHERE id = $1 AND tenant_id = $2',
            [id, payload.tenant_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Attachment no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error obteniendo attachment:', error);
        res.status(500).json({ message: "Error al obtener attachment" });
    }
};

// Update attachment
export const updateAttachment = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    const { id } = req.params;
    const { filename, mime_type, base64_content } = req.body;

    try {
        // Verificar que el attachment existe y pertenece al tenant
        const attachmentCheck = await pool.query(
            'SELECT id FROM office.clinical_history_attachments WHERE id = $1 AND tenant_id = $2',
            [id, payload.tenant_id]
        );

        if (attachmentCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Attachment no encontrado' });
        }

        const result = await pool.query(
            `UPDATE office.clinical_history_attachments 
             SET filename = $1, mime_type = $2, base64_content = $3
             WHERE id = $4 AND tenant_id = $5
             RETURNING *`,
            [filename, mime_type, base64_content, id, payload.tenant_id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error actualizando attachment:', error);
        res.status(500).json({ message: "Error al actualizar attachment: " + error.message });
    }
};

// Delete attachment
export const deleteAttachment = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    const { id } = req.params;

    try {
        // Verificar que el attachment existe y pertenece al tenant
        const attachmentCheck = await pool.query(
            'SELECT id FROM office.clinical_history_attachments WHERE id = $1 AND tenant_id = $2',
            [id, payload.tenant_id]
        );

        if (attachmentCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Attachment no encontrado' });
        }

        // Eliminar el attachment
        await pool.query(
            'DELETE FROM office.clinical_history_attachments WHERE id = $1 AND tenant_id = $2',
            [id, payload.tenant_id]
        );

        res.json({ message: 'Attachment eliminado exitosamente' });
    } catch (error) {
        console.error('Error eliminando attachment:', error);
        res.status(500).json({ message: "Error al eliminar attachment: " + error.message });
    }
};

// Get clinical history with attachments
export const getClinicalHistoryWithAttachments = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    const { id } = req.params;

    try {
        // Obtener el historial clínico
        const historyResult = await pool.query(
            `SELECT ch.*, p.name as patient_name, p.last_name as patient_last_name 
             FROM office.clinical_history ch
             INNER JOIN office.patients p ON ch.patient_id = p.id
             WHERE ch.id = $1 AND ch.tenant_id = $2`,
            [id, payload.tenant_id]
        );

        if (historyResult.rows.length === 0) {
            return res.status(404).json({ message: 'Historial clínico no encontrado' });
        }

        // Obtener los attachments
        const attachmentsResult = await pool.query(
            'SELECT id, filename, mime_type, created_at FROM office.clinical_history_attachments WHERE history_id = $1 AND tenant_id = $2 ORDER BY created_at DESC',
            [id, payload.tenant_id]
        );

        const clinicalHistory = historyResult.rows[0];
        clinicalHistory.attachments = attachmentsResult.rows;

        res.json(clinicalHistory);
    } catch (error) {
        console.error('Error obteniendo historial clínico con attachments:', error);
        res.status(500).json({ message: "Error al obtener historial clínico con attachments" });
    }
}; 

// Get all attachments for tenant (admin function)
export const getAllAttachments = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    try {
        const result = await pool.query(
            `SELECT cha.*, ch.patient_id, p.name as patient_name, p.last_name as patient_last_name
             FROM office.clinical_history_attachments cha
             INNER JOIN office.clinical_history ch ON cha.history_id = ch.id
             INNER JOIN office.patients p ON ch.patient_id = p.id
             WHERE cha.tenant_id = $1
             ORDER BY cha.created_at DESC`,
            [payload.tenant_id]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error obteniendo todos los attachments:', error);
        res.status(500).json({ message: "Error al obtener attachments" });
    }
}; 