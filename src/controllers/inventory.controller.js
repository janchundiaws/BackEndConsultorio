import { pool } from "../db.js";
import { decodeToken } from './../helpers/jwt.js';

// =====================================================
// MASTER SUPPLIES MANAGEMENT
// =====================================================

// Create a new supply
export const createSupply = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const {
        code,
        name,
        description,
        category,
        unit_measure,
        presentation,
        unit_cost,
        sale_price,
        min_stock,
        max_stock,
        main_supplier,
        warehouse_location
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO inventory.master_supplies (
                tenant_id, code, name, description, category, unit_measure, presentation,
                unit_cost, sale_price, min_stock, max_stock, main_supplier, warehouse_location,
                created_by
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
            ) RETURNING *`,
            [
                payload.tenant_id, code, name, description, category, unit_measure, presentation,
                unit_cost, sale_price, min_stock, max_stock, main_supplier, warehouse_location,
                payload.email
            ]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating supply:', error);
        res.status(500).json({ message: "Error creating supply: " + error.message });
    }
};

// Get all supplies for tenant
export const getSupplies = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM inventory.master_supplies WHERE tenant_id = $1 AND status = true ORDER BY name',
            [payload.tenant_id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error getting supplies:', error);
        res.status(500).json({ message: "Error getting supplies" });
    }
};

// Get supply by multiple filters
export const getSupplyById = async (req, res) => {
    const { filterField, value } = req.params;
    const payload = decodeToken(req.headers.authorization);

    if (!payload) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    let query = "";
    let queryValue = value;

    switch (filterField) {
        case 'id':
            // Convert to number (validate that it's an integer)
            const id = parseInt(value, 10);

            if (isNaN(id)) {
                return res.status(400).json({ error: 'Invalid ID. Must be a number' });
            }
            queryValue = id;
            query = 'SELECT * FROM inventory.master_supplies WHERE supply_id = $1 AND tenant_id = $2 AND status = true';
            break;

        case 'code':
            query = 'SELECT * FROM inventory.master_supplies WHERE code = $1 AND tenant_id = $2 AND status = true';
            break;

        case 'name':
            query = 'SELECT * FROM inventory.master_supplies WHERE name ILIKE $1 AND tenant_id = $2 AND status = true';
            queryValue = `%${value}%`;
            break;

        case 'category':
            query = 'SELECT * FROM inventory.master_supplies WHERE category ILIKE $1 AND tenant_id = $2 AND status = true';
            queryValue = `%${value}%`;
            break;

        default:
            return res.status(400).json({ error: 'Invalid filter. Use: id, code, name, or category' });
    }

    try {
        const result = await pool.query(query, [queryValue, payload.tenant_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Supply not found' });
        }

        res.json(result.rows);
    } catch (error) {
        console.error('Error getting supply:', error);
        res.status(500).json({ message: "Error getting supply" });
    }
};

// Update supply
export const updateSupply = async (req, res) => {
    const { id } = req.params;
    const payload = decodeToken(req.headers.authorization);

    if (!payload) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const {
        code,
        name,
        description,
        category,
        unit_measure,
        presentation,
        unit_cost,
        sale_price,
        min_stock,
        max_stock,
        main_supplier,
        warehouse_location
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE inventory.master_supplies SET 
                code = $1, name = $2, description = $3, category = $4, unit_measure = $5,
                presentation = $6, unit_cost = $7, sale_price = $8, min_stock = $9,
                max_stock = $10, main_supplier = $11, warehouse_location = $12, updated_by = $13
            WHERE supply_id = $14 AND tenant_id = $15 RETURNING *`,
            [
                code, name, description, category, unit_measure, presentation,
                unit_cost, sale_price, min_stock, max_stock, main_supplier, warehouse_location,
                payload.email, id, payload.tenant_id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Supply not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating supply:', error);
        res.status(500).json({ message: "Error updating supply" });
    }
};

// Delete supply (soft delete)
export const deleteSupply = async (req, res) => {
    const { id } = req.params;
    const payload = decodeToken(req.headers.authorization);

    if (!payload) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    try {
        const result = await pool.query(
            'UPDATE inventory.master_supplies SET status = false WHERE supply_id = $1 AND tenant_id = $2 RETURNING *',
            [id, payload.tenant_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Supply not found' });
        }

        res.json({ message: 'Supply deleted successfully' });
    } catch (error) {
        console.error('Error deleting supply:', error);
        res.status(500).json({ message: "Error deleting supply" });
    }
};

// =====================================================
// INCOMING TRANSACTIONS (PURCHASES/ENTRIES)
// =====================================================

// Create incoming transaction
export const createIncomingTransaction = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const {
        transaction_number,
        transaction_date,
        supplier_id,
        invoice_number,
        transaction_type,
        subtotal,
        tax_amount,
        total,
        notes,
        details
    } = req.body;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Create incoming transaction header
        const headerResult = await client.query(
            `INSERT INTO inventory.incoming_transactions (
                tenant_id, transaction_number, transaction_date, supplier_id, invoice_number,
                transaction_type, subtotal, tax_amount, total, notes, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            [
                payload.tenant_id, transaction_number, transaction_date, supplier_id, invoice_number,
                transaction_type, subtotal, tax_amount, total, notes, payload.email
            ]
        );

        const incoming_id = headerResult.rows[0].incoming_id;

        // Insert details
        for (const detail of details) {
            await client.query(
                `INSERT INTO inventory.incoming_details (
                    incoming_id, supply_id, quantity, unit_cost, subtotal,
                    batch_number, expiration_date, warehouse_location, notes
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [
                    incoming_id, detail.supply_id, detail.quantity, detail.unit_cost, detail.subtotal,
                    detail.batch_number, detail.expiration_date, detail.warehouse_location, detail.notes
                ]
            );
        }

        await client.query('COMMIT');

        // Get complete transaction with details
        const completeResult = await pool.query(
            `SELECT 
                it.*,
                s.name as supplier_name,
                json_agg(
                    json_build_object(
                        'detail_id', id.detail_id,
                        'supply_id', id.supply_id,
                        'quantity', id.quantity,
                        'unit_cost', id.unit_cost,
                        'subtotal', id.subtotal,
                        'batch_number', id.batch_number,
                        'expiration_date', id.expiration_date,
                        'warehouse_location', id.warehouse_location,
                        'notes', id.notes,
                        'supply_name', ms.name,
                        'supply_code', ms.code
                    )
                ) as details
            FROM inventory.incoming_transactions it
            LEFT JOIN inventory.suppliers s ON it.supplier_id = s.supplier_id
            LEFT JOIN inventory.incoming_details id ON it.incoming_id = id.incoming_id
            LEFT JOIN inventory.master_supplies ms ON id.supply_id = ms.supply_id
            WHERE it.incoming_id = $1 AND it.tenant_id = $2
            GROUP BY it.incoming_id, s.name`,
            [incoming_id, payload.tenant_id]
        );

        res.status(201).json(completeResult.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating incoming transaction:', error);
        res.status(500).json({ message: "Error creating incoming transaction: " + error.message });
    } finally {
        client.release();
    }
};

// Get all incoming transactions
export const getIncomingTransactions = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    try {
        const result = await pool.query(
            `SELECT 
                it.*,
                s.name as supplier_name,
                s.code as supplier_code
            FROM inventory.incoming_transactions it
            LEFT JOIN inventory.suppliers s ON it.supplier_id = s.supplier_id
            WHERE it.tenant_id = $1
            ORDER BY it.transaction_date DESC, it.incoming_id DESC`,
            [payload.tenant_id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error getting incoming transactions:', error);
        res.status(500).json({ message: "Error getting incoming transactions" });
    }
};

// Get incoming transaction by ID with details
export const getIncomingTransactionById = async (req, res) => {
    const { id } = req.params;
    const payload = decodeToken(req.headers.authorization);

    if (!payload) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    try {
        const result = await pool.query(
            `SELECT 
                it.*,
                s.name as supplier_name,
                s.code as supplier_code,
                json_agg(
                    json_build_object(
                        'detail_id', id.detail_id,
                        'supply_id', id.supply_id,
                        'quantity', id.quantity,
                        'unit_cost', id.unit_cost,
                        'subtotal', id.subtotal,
                        'batch_number', id.batch_number,
                        'expiration_date', id.expiration_date,
                        'warehouse_location', id.warehouse_location,
                        'notes', id.notes,
                        'supply_name', ms.name,
                        'supply_code', ms.code
                    )
                ) as details
            FROM inventory.incoming_transactions it
            LEFT JOIN inventory.suppliers s ON it.supplier_id = s.supplier_id
            LEFT JOIN inventory.incoming_details id ON it.incoming_id = id.incoming_id
            LEFT JOIN inventory.master_supplies ms ON id.supply_id = ms.supply_id
            WHERE it.incoming_id = $1 AND it.tenant_id = $2
            GROUP BY it.incoming_id, s.name, s.code`,
            [id, payload.tenant_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Incoming transaction not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error getting incoming transaction:', error);
        res.status(500).json({ message: "Error getting incoming transaction" });
    }
};

// =====================================================
// OUTGOING TRANSACTIONS (SALES/CONSUMPTION)
// =====================================================

// Create outgoing transaction
export const createOutgoingTransaction = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const {
        transaction_number,
        transaction_date,
        transaction_type,
        patient_id,
        dentist_id,
        reason,
        total,
        details
    } = req.body;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Create outgoing transaction header
        const headerResult = await client.query(
            `INSERT INTO inventory.outgoing_transactions (
                tenant_id, transaction_number, transaction_date, transaction_type,
                patient_id, dentist_id, reason, total, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [
                payload.tenant_id, transaction_number, transaction_date, transaction_type,
                patient_id, dentist_id, reason, total, payload.email
            ]
        );

        const outgoing_id = headerResult.rows[0].outgoing_id;

        // Insert details
        for (const detail of details) {
            await client.query(
                `INSERT INTO inventory.outgoing_details (
                    outgoing_id, supply_id, quantity, unit_cost, subtotal,
                    batch_number, notes
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    outgoing_id, detail.supply_id, detail.quantity, detail.unit_cost,
                    detail.subtotal, detail.batch_number, detail.notes
                ]
            );
        }

        await client.query('COMMIT');

        // Get complete transaction with details
        const completeResult = await pool.query(
            `SELECT 
                ot.*,
                json_agg(
                    json_build_object(
                        'detail_id', od.detail_id,
                        'supply_id', od.supply_id,
                        'quantity', od.quantity,
                        'unit_cost', od.unit_cost,
                        'subtotal', od.subtotal,
                        'batch_number', od.batch_number,
                        'notes', od.notes,
                        'supply_name', ms.name,
                        'supply_code', ms.code
                    )
                ) as details
            FROM inventory.outgoing_transactions ot
            LEFT JOIN inventory.outgoing_details od ON ot.outgoing_id = od.outgoing_id
            LEFT JOIN inventory.master_supplies ms ON od.supply_id = ms.supply_id
            WHERE ot.outgoing_id = $1 AND ot.tenant_id = $2
            GROUP BY ot.outgoing_id`,
            [outgoing_id, payload.tenant_id]
        );

        res.status(201).json(completeResult.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating outgoing transaction:', error);
        res.status(500).json({ message: "Error creating outgoing transaction: " + error.message });
    } finally {
        client.release();
    }
};

// Get all outgoing transactions
export const getOutgoingTransactions = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    try {
        const result = await pool.query(
            `SELECT 
                ot.*,
                p.name as patient_name,
                p.last_name as patient_last_name,
                d.name as dentist_name
            FROM inventory.outgoing_transactions ot
            LEFT JOIN office.patients p ON ot.patient_id = p.id
            LEFT JOIN config.dentists d ON ot.dentist_id = d.id
            WHERE ot.tenant_id = $1
            ORDER BY ot.transaction_date DESC, ot.outgoing_id DESC`,
            [payload.tenant_id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error getting outgoing transactions:', error);
        res.status(500).json({ message: "Error getting outgoing transactions" });
    }
};

// Get outgoing transaction by ID with details
export const getOutgoingTransactionById = async (req, res) => {
    const { id } = req.params;
    const payload = decodeToken(req.headers.authorization);

    if (!payload) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    try {
        const result = await pool.query(
            `SELECT 
                ot.*,
                p.name as patient_name,
                p.last_name as patient_last_name,
                d.name as dentist_name,
                json_agg(
                    json_build_object(
                        'detail_id', od.detail_id,
                        'supply_id', od.supply_id,
                        'quantity', od.quantity,
                        'unit_cost', od.unit_cost,
                        'subtotal', od.subtotal,
                        'batch_number', od.batch_number,
                        'notes', od.notes,
                        'supply_name', ms.name,
                        'supply_code', ms.code
                    )
                ) as details
            FROM inventory.outgoing_transactions ot
            LEFT JOIN office.patients p ON ot.patient_id = p.id
            LEFT JOIN config.dentists d ON ot.dentist_id = d.id
            LEFT JOIN inventory.outgoing_details od ON ot.outgoing_id = od.outgoing_id
            LEFT JOIN inventory.master_supplies ms ON od.supply_id = ms.supply_id
            WHERE ot.outgoing_id = $1 AND ot.tenant_id = $2
            GROUP BY ot.outgoing_id, p.name, p.last_name, d.name`,
            [id, payload.tenant_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Outgoing transaction not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error getting outgoing transaction:', error);
        res.status(500).json({ message: "Error getting outgoing transaction" });
    }
};

// =====================================================
// STOCK MANAGEMENT AND QUERIES
// =====================================================

// Get current stock
export const getCurrentStock = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    try {
        const result = await pool.query(
            `SELECT * FROM inventory.current_stock_view WHERE tenant_id = $1 ORDER BY name`,
            [payload.tenant_id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error getting current stock:', error);
        res.status(500).json({ message: "Error getting current stock" });
    }
};

// Get low stock items
export const getLowStockItems = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    try {
        const result = await pool.query(
            `SELECT * FROM inventory.low_stock_view WHERE tenant_id = $1 ORDER BY current_stock ASC`,
            [payload.tenant_id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error getting low stock items:', error);
        res.status(500).json({ message: "Error getting low stock items" });
    }
};

// Get inventory movements
export const getInventoryMovements = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const { supply_id, start_date, end_date, movement_type } = req.query;

    try {
        let query = `
            SELECT * FROM inventory.recent_movements_view 
            WHERE tenant_id = $1
        `;
        let params = [payload.tenant_id];
        let paramCount = 1;

        if (supply_id) {
            paramCount++;
            query += ` AND supply_id = $${paramCount}`;
            params.push(supply_id);
        }

        if (start_date) {
            paramCount++;
            query += ` AND movement_date >= $${paramCount}`;
            params.push(start_date);
        }

        if (end_date) {
            paramCount++;
            query += ` AND movement_date <= $${paramCount}`;
            params.push(end_date);
        }

        if (movement_type) {
            paramCount++;
            query += ` AND movement_type = $${paramCount}`;
            params.push(movement_type);
        }

        query += ` ORDER BY movement_date DESC LIMIT 100`;

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error getting inventory movements:', error);
        res.status(500).json({ message: "Error getting inventory movements" });
    }
};

// Get stock by supply ID
export const getStockBySupplyId = async (req, res) => {
    const { supply_id } = req.params;
    const payload = decodeToken(req.headers.authorization);

    if (!payload) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    try {
        const result = await pool.query(
            `SELECT * FROM inventory.current_stock 
            WHERE supply_id = $1 AND tenant_id = $2 
            ORDER BY expiration_date ASC`,
            [supply_id, payload.tenant_id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error getting stock by supply:', error);
        res.status(500).json({ message: "Error getting stock by supply" });
    }
};

// =====================================================
// SUPPLIERS MANAGEMENT
// =====================================================

// Create supplier
export const createSupplier = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const {
        code,
        name,
        business_name,
        tax_id,
        address,
        phone,
        email,
        main_contact
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO inventory.suppliers (
                tenant_id, code, name, business_name, tax_id, address, phone, email, main_contact
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [payload.tenant_id, code, name, business_name, tax_id, address, phone, email, main_contact]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating supplier:', error);
        res.status(500).json({ message: "Error creating supplier: " + error.message });
    }
};

// Get all suppliers
export const getSuppliers = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM inventory.suppliers WHERE tenant_id = $1 AND status = true ORDER BY name',
            [payload.tenant_id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error getting suppliers:', error);
        res.status(500).json({ message: "Error getting suppliers" });
    }
};

// Get supplier by multiple filters
export const getSupplierById = async (req, res) => {
    const { filterField, value } = req.params;
    const payload = decodeToken(req.headers.authorization);

    if (!payload) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    let query = "";
    let queryValue = value;

    switch (filterField) {
        case 'id':
            // Convert to number (validate that it's an integer)
            const id = parseInt(value, 10);

            if (isNaN(id)) {
                return res.status(400).json({ error: 'Invalid ID. Must be a number' });
            }
            queryValue = id;
            query = 'SELECT * FROM inventory.suppliers WHERE supplier_id = $1 AND tenant_id = $2 AND status = true';
            break;

        case 'code':
            query = 'SELECT * FROM inventory.suppliers WHERE code = $1 AND tenant_id = $2 AND status = true';
            break;

        case 'name':
            query = 'SELECT * FROM inventory.suppliers WHERE name ILIKE $1 AND tenant_id = $2 AND status = true';
            queryValue = `%${value}%`;
            break;

        case 'business_name':
            query = 'SELECT * FROM inventory.suppliers WHERE business_name ILIKE $1 AND tenant_id = $2 AND status = true';
            queryValue = `%${value}%`;
            break;

        default:
            return res.status(400).json({ error: 'Invalid filter' });
    }

    try {
        const result = await pool.query(query, [queryValue, payload.tenant_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        res.json(result.rows);
    } catch (error) {
        console.error('Error getting supplier:', error);
        res.status(500).json({ message: "Error getting supplier" });
    }
};


// =====================================================
// CATEGORIES AND UNITS MANAGEMENT
// =====================================================

// Get supply categories
export const getSupplyCategories = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM inventory.supply_categories WHERE tenant_id = $1 AND status = true ORDER BY name',
            [payload.tenant_id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error getting categories:', error);
        res.status(500).json({ message: "Error getting categories" });
    }
};

// Get units of measure
export const getUnitsOfMeasure = async (req, res) => {
    const payload = decodeToken(req.headers.authorization);
    if (!payload) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM inventory.units_of_measure WHERE tenant_id = $1 AND status = true ORDER BY name',
            [payload.tenant_id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error getting units of measure:', error);
        res.status(500).json({ message: "Error getting units of measure" });
    }
}; 