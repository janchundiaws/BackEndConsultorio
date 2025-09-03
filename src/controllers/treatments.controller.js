import { pool } from "../db.js";
import { decodeToken } from './../helpers/jwt.js';

// =====================================================
// TREATMENTS MANAGEMENT
// =====================================================

// Create a new treatment
export const createTreatment = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    const {
        appointment_id,
        description,
        cost,
        completed = false
    } = req.body;

    try {
        // Verificar que el appointment existe y pertenece al tenant
        const appointmentCheck = await pool.query(
            'SELECT id FROM office.appointments WHERE id = $1 AND tenant_id = $2',
            [appointment_id, payload.tenant_id]
        );

        if (appointmentCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Appointment no encontrado' });
        }

        const result = await pool.query(
            `INSERT INTO office.treatments (
                tenant_id, appointment_id, description, cost, completed
            ) VALUES (
                $1, $2, $3, $4, $5
            ) RETURNING *`,
            [payload.tenant_id, appointment_id, description, cost, completed]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creando treatment:', error);
        res.status(500).json({ message: "Error al crear treatment: " + error.message });
    }
};

// Get all treatments for tenant with filters
export const getTreatments = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    const { 
        appointment_id, 
        completed, 
        cost_min, 
        cost_max,
        page = 1,
        limit = 50
    } = req.query;

    try {
        let query = `
            SELECT t.*, 
                   a.appointment_time,
                   a.status as appointment_status,
                   p.name as patient_name, 
                   p.last_name as patient_last_name,
                   p.phone as patient_phone,
                   d.name as dentist_name,
                   o.name as office_name
            FROM office.treatments t
            INNER JOIN office.appointments a ON t.appointment_id = a.id
            INNER JOIN office.patients p ON a.patient_id = p.id
            INNER JOIN config.dentists d ON a.dentist_id = d.id
            INNER JOIN config.offices o ON a.office_id = o.id
            WHERE t.tenant_id = $1
        `;
        
        const queryParams = [payload.tenant_id];
        let paramIndex = 2;

        // Add filters
        if (appointment_id) {
            query += ` AND t.appointment_id = $${paramIndex}`;
            queryParams.push(appointment_id);
            paramIndex++;
        }

        if (completed !== undefined) {
            query += ` AND t.completed = $${paramIndex}`;
            queryParams.push(completed === 'true');
            paramIndex++;
        }

        if (cost_min) {
            query += ` AND t.cost >= $${paramIndex}`;
            queryParams.push(parseFloat(cost_min));
            paramIndex++;
        }

        if (cost_max) {
            query += ` AND t.cost <= $${paramIndex}`;
            queryParams.push(parseFloat(cost_max));
            paramIndex++;
        }

        // Add ordering and pagination
        query += ` ORDER BY t.id DESC`;
        
        const offset = (page - 1) * limit;
        query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        queryParams.push(limit, offset);

        const result = await pool.query(query, queryParams);

        // Get total count for pagination
        let countQuery = `
            SELECT COUNT(*) as total
            FROM office.treatments t
            WHERE t.tenant_id = $1
        `;
        
        const countParams = [payload.tenant_id];
        let countParamIndex = 2;

        if (appointment_id) {
            countQuery += ` AND t.appointment_id = $${countParamIndex}`;
            countParams.push(appointment_id);
            countParamIndex++;
        }

        if (completed !== undefined) {
            countQuery += ` AND t.completed = $${countParamIndex}`;
            countParams.push(completed === 'true');
            countParamIndex++;
        }

        if (cost_min) {
            countQuery += ` AND t.cost >= $${countParamIndex}`;
            countParams.push(parseFloat(cost_min));
            countParamIndex++;
        }

        if (cost_max) {
            countQuery += ` AND t.cost <= $${countParamIndex}`;
            countParams.push(parseFloat(cost_max));
            countParamIndex++;
        }

        const countResult = await pool.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].total);

        res.json({
            treatments: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error obteniendo treatments:', error);
        res.status(500).json({ message: "Error al obtener treatments" });
    }
};

// Get treatments by appointment
export const getTreatmentsByAppointment = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    const { appointment_id } = req.params;

    try {
        // Verificar que el appointment existe y pertenece al tenant
        const appointmentCheck = await pool.query(
            `SELECT a.id, a.appointment_time, a.status,
                    p.name as patient_name, p.last_name as patient_last_name,
                    d.name as dentist_name, o.name as office_name
             FROM office.appointments a
             INNER JOIN office.patients p ON a.patient_id = p.id
             INNER JOIN config.dentists d ON a.dentist_id = d.id
             INNER JOIN config.offices o ON a.office_id = o.id
             WHERE a.id = $1 AND a.tenant_id = $2`,
            [appointment_id, payload.tenant_id]
        );

        if (appointmentCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Appointment no encontrado' });
        }

        const result = await pool.query(
            `SELECT t.*
             FROM office.treatments t
             WHERE t.appointment_id = $1 AND t.tenant_id = $2
             ORDER BY t.id ASC`,
            [appointment_id, payload.tenant_id]
        );

        res.json({
            appointment: appointmentCheck.rows[0],
            treatments: result.rows
        });
    } catch (error) {
        console.error('Error obteniendo treatments del appointment:', error);
        res.status(500).json({ message: "Error al obtener treatments del appointment" });
    }
};

// Get treatment by ID
export const getTreatmentById = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    const { id } = req.params;

    try {
        const result = await pool.query(
            `SELECT t.*, 
                    a.appointment_time,
                    a.status as appointment_status,
                    p.name as patient_name, 
                    p.last_name as patient_last_name,
                    p.phone as patient_phone,
                    p.email as patient_email,
                    d.name as dentist_name,
                    o.name as office_name
             FROM office.treatments t
             INNER JOIN office.appointments a ON t.appointment_id = a.id
             INNER JOIN office.patients p ON a.patient_id = p.id
             INNER JOIN config.dentists d ON a.dentist_id = d.id
             INNER JOIN config.offices o ON a.office_id = o.id
             WHERE t.id = $1 AND t.tenant_id = $2`,
            [id, payload.tenant_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Treatment no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error obteniendo treatment:', error);
        res.status(500).json({ message: "Error al obtener treatment" });
    }
};

// Update treatment
export const updateTreatment = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    const { id } = req.params;
    const { 
        appointment_id, 
        description, 
        cost, 
        completed 
    } = req.body;

    try {
        // Verificar que el treatment existe y pertenece al tenant
        const treatmentCheck = await pool.query(
            'SELECT id FROM office.treatments WHERE id = $1 AND tenant_id = $2',
            [id, payload.tenant_id]
        );

        if (treatmentCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Treatment no encontrado' });
        }

        // Si se está cambiando el appointment_id, verificar que existe
        if (appointment_id) {
            const appointmentCheck = await pool.query(
                'SELECT id FROM office.appointments WHERE id = $1 AND tenant_id = $2',
                [appointment_id, payload.tenant_id]
            );
            if (appointmentCheck.rows.length === 0) {
                return res.status(404).json({ message: 'Appointment no encontrado' });
            }
        }

        // Construir la query de actualización dinámicamente
        const updateFields = [];
        const updateValues = [];
        let paramIndex = 1;

        if (appointment_id !== undefined) {
            updateFields.push(`appointment_id = $${paramIndex}`);
            updateValues.push(appointment_id);
            paramIndex++;
        }

        if (description !== undefined) {
            updateFields.push(`description = $${paramIndex}`);
            updateValues.push(description);
            paramIndex++;
        }

        if (cost !== undefined) {
            updateFields.push(`cost = $${paramIndex}`);
            updateValues.push(cost);
            paramIndex++;
        }

        if (completed !== undefined) {
            updateFields.push(`completed = $${paramIndex}`);
            updateValues.push(completed);
            paramIndex++;
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'No hay campos para actualizar' });
        }

        updateValues.push(payload.tenant_id, id);

        const result = await pool.query(
            `UPDATE office.treatments 
             SET ${updateFields.join(', ')}
             WHERE tenant_id = $${paramIndex} AND id = $${paramIndex + 1}
             RETURNING *`,
            updateValues
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error actualizando treatment:', error);
        res.status(500).json({ message: "Error al actualizar treatment: " + error.message });
    }
};

// Delete treatment
export const deleteTreatment = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    const { id } = req.params;

    try {
        // Verificar que el treatment existe y pertenece al tenant
        const treatmentCheck = await pool.query(
            'SELECT id FROM office.treatments WHERE id = $1 AND tenant_id = $2',
            [id, payload.tenant_id]
        );

        if (treatmentCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Treatment no encontrado' });
        }

        // Eliminar el treatment
        await pool.query(
            'DELETE FROM office.treatments WHERE id = $1 AND tenant_id = $2',
            [id, payload.tenant_id]
        );

        res.json({ message: 'Treatment eliminado exitosamente' });
    } catch (error) {
        console.error('Error eliminando treatment:', error);
        res.status(500).json({ message: "Error al eliminar treatment: " + error.message });
    }
};

// Get treatment statistics
export const getTreatmentStats = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    const { date_from, date_to } = req.query;

    try {
        let whereClause = 'WHERE t.tenant_id = $1';
        const queryParams = [payload.tenant_id];
        let paramIndex = 2;

        if (date_from) {
            whereClause += ` AND a.appointment_time >= $${paramIndex}`;
            queryParams.push(date_from);
            paramIndex++;
        }

        if (date_to) {
            whereClause += ` AND a.appointment_time <= $${paramIndex}`;
            queryParams.push(date_to);
            paramIndex++;
        }

        const statsQuery = `
            SELECT 
                COUNT(*) as total_treatments,
                COUNT(CASE WHEN t.completed = true THEN 1 END) as completed_treatments,
                COUNT(CASE WHEN t.completed = false THEN 1 END) as pending_treatments,
                COALESCE(SUM(t.cost), 0) as total_revenue,
                COALESCE(AVG(t.cost), 0) as average_cost,
                COALESCE(SUM(CASE WHEN t.completed = true THEN t.cost ELSE 0 END), 0) as completed_revenue
            FROM office.treatments t
            INNER JOIN office.appointments a ON t.appointment_id = a.id
            ${whereClause}
        `;

        const result = await pool.query(statsQuery, queryParams);

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error obteniendo estadísticas de treatments:', error);
        res.status(500).json({ message: "Error al obtener estadísticas de treatments" });
    }
};

// Mark treatment as completed
export const markTreatmentCompleted = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    const { id } = req.params;

    try {
        // Verificar que el treatment existe y pertenece al tenant
        const treatmentCheck = await pool.query(
            'SELECT id, completed FROM office.treatments WHERE id = $1 AND tenant_id = $2',
            [id, payload.tenant_id]
        );

        if (treatmentCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Treatment no encontrado' });
        }

        if (treatmentCheck.rows[0].completed) {
            return res.status(400).json({ message: 'El treatment ya está completado' });
        }

        const result = await pool.query(
            `UPDATE office.treatments 
             SET completed = true
             WHERE id = $1 AND tenant_id = $2
             RETURNING *`,
            [id, payload.tenant_id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error marcando treatment como completado:', error);
        res.status(500).json({ message: "Error al marcar treatment como completado: " + error.message });
    }
};

// Get treatments by patient
export const getTreatmentsByPatient = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    const { patient_id } = req.params;
    const { completed, date_from, date_to } = req.query;

    try {
        // Verificar que el paciente existe y pertenece al tenant
        const patientCheck = await pool.query(
            'SELECT id, name, last_name FROM office.patients WHERE id = $1 AND tenant_id = $2 AND status = 1',
            [patient_id, payload.tenant_id]
        );

        if (patientCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Paciente no encontrado' });
        }

        let query = `
            SELECT t.*, 
                   a.appointment_time,
                   a.status as appointment_status,
                   d.name as dentist_name,
                   o.name as office_name
            FROM office.treatments t
            INNER JOIN office.appointments a ON t.appointment_id = a.id
            INNER JOIN config.dentists d ON a.dentist_id = d.id
            INNER JOIN config.offices o ON a.office_id = o.id
            WHERE t.tenant_id = $1 AND a.patient_id = $2
        `;
        
        const queryParams = [payload.tenant_id, patient_id];
        let paramIndex = 3;

        if (completed !== undefined) {
            query += ` AND t.completed = $${paramIndex}`;
            queryParams.push(completed === 'true');
            paramIndex++;
        }

        if (date_from) {
            query += ` AND a.appointment_time >= $${paramIndex}`;
            queryParams.push(date_from);
            paramIndex++;
        }

        if (date_to) {
            query += ` AND a.appointment_time <= $${paramIndex}`;
            queryParams.push(date_to);
            paramIndex++;
        }

        query += ` ORDER BY a.appointment_time DESC`;

        const result = await pool.query(query, queryParams);

        res.json({
            patient: patientCheck.rows[0],
            treatments: result.rows
        });
    } catch (error) {
        console.error('Error obteniendo treatments del paciente:', error);
        res.status(500).json({ message: "Error al obtener treatments del paciente" });
    }
};