import { Router } from "express";
import {
    // Master Supplies
    createSupply,
    getSupplies,
    getSupplyById,
    updateSupply,
    deleteSupply,
    
    // Incoming Transactions
    createIncomingTransaction,
    getIncomingTransactions,
    getIncomingTransactionById,
    
    // Outgoing Transactions
    createOutgoingTransaction,
    getOutgoingTransactions,
    getOutgoingTransactionById,
    
    // Stock Management
    getCurrentStock,
    getLowStockItems,
    getInventoryMovements,
    getStockBySupplyId,
    
    // Suppliers
    createSupplier,
    getSuppliers,
    getSupplierById,
    
    // Categories and Units
    getSupplyCategories,
    getUnitsOfMeasure
} from "../controllers/inventory.controller.js";
import { requireRoles } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Inventory management system
 */

// =====================================================
// MASTER SUPPLIES ROUTES
// =====================================================

/**
 * @swagger
 * /inventory/supplies:
 *   post:
 *     summary: Create a new supply
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               unit_measure:
 *                 type: string
 *               presentation:
 *                 type: string
 *               unit_cost:
 *                 type: number
 *               sale_price:
 *                 type: number
 *               min_stock:
 *                 type: integer
 *               max_stock:
 *                 type: integer
 *               main_supplier:
 *                 type: string
 *               warehouse_location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Supply created successfully
 */
router.post('/inventory/supplies/', createSupply);

/**
 * @swagger
 * /inventory/supplies:
 *   get:
 *     summary: Get all supplies
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: List of supplies
 */
router.get('/inventory/supplies/', getSupplies);

/**
 * @swagger
 * /inventory/supplies/{id}:
 *   get:
 *     summary: Get supply by ID
 *     tags: [Inventory]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Supply details
 */
router.get('/inventory/supplies/:id', getSupplyById);

/**
 * @swagger
 * /inventory/supplies/{id}:
 *   put:
 *     summary: Update supply
 *     tags: [Inventory]
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
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               unit_measure:
 *                 type: string
 *               presentation:
 *                 type: string
 *               unit_cost:
 *                 type: number
 *               sale_price:
 *                 type: number
 *               min_stock:
 *                 type: integer
 *               max_stock:
 *                 type: integer
 *               main_supplier:
 *                 type: string
 *               warehouse_location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Supply updated successfully
 */
router.put('/inventory/supplies/:id', updateSupply);

/**
 * @swagger
 * /inventory/supplies/{id}:
 *   delete:
 *     summary: Delete supply (soft delete)
 *     tags: [Inventory]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Supply deleted successfully
 */
router.delete('/inventory/supplies/:id', deleteSupply);

// =====================================================
// INCOMING TRANSACTIONS ROUTES
// =====================================================

/**
 * @swagger
 * /inventory/incoming:
 *   post:
 *     summary: Create incoming transaction (purchase/entry)
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transaction_number:
 *                 type: string
 *               transaction_date:
 *                 type: string
 *                 format: date
 *               supplier_id:
 *                 type: integer
 *               invoice_number:
 *                 type: string
 *               transaction_type:
 *                 type: string
 *                 enum: [PURCHASE, DONATION, RETURN]
 *               subtotal:
 *                 type: number
 *               tax_amount:
 *                 type: number
 *               total:
 *                 type: number
 *               notes:
 *                 type: string
 *               details:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     supply_id:
 *                       type: integer
 *                     quantity:
 *                       type: number
 *                     unit_cost:
 *                       type: number
 *                     subtotal:
 *                       type: number
 *                     batch_number:
 *                       type: string
 *                     expiration_date:
 *                       type: string
 *                       format: date
 *                     warehouse_location:
 *                       type: string
 *                     notes:
 *                       type: string
 *     responses:
 *       201:
 *         description: Incoming transaction created successfully
 */
router.post('/inventory/incoming/', createIncomingTransaction);

/**
 * @swagger
 * /inventory/incoming:
 *   get:
 *     summary: Get all incoming transactions
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: List of incoming transactions
 */
router.get('/inventory/incoming/', getIncomingTransactions);

/**
 * @swagger
 * /inventory/incoming/{id}:
 *   get:
 *     summary: Get incoming transaction by ID with details
 *     tags: [Inventory]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Incoming transaction details
 */
router.get('/inventory/incoming/:id', getIncomingTransactionById);

// =====================================================
// OUTGOING TRANSACTIONS ROUTES
// =====================================================

/**
 * @swagger
 * /inventory/outgoing:
 *   post:
 *     summary: Create outgoing transaction (sale/consumption)
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transaction_number:
 *                 type: string
 *               transaction_date:
 *                 type: string
 *                 format: date
 *               transaction_type:
 *                 type: string
 *                 enum: [CONSUMPTION, SALE, LOSS, ADJUSTMENT]
 *               patient_id:
 *                 type: integer
 *               dentist_id:
 *                 type: integer
 *               reason:
 *                 type: string
 *               total:
 *                 type: number
 *               details:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     supply_id:
 *                       type: integer
 *                     quantity:
 *                       type: number
 *                     unit_cost:
 *                       type: number
 *                     subtotal:
 *                       type: number
 *                     batch_number:
 *                       type: string
 *                     notes:
 *                       type: string
 *     responses:
 *       201:
 *         description: Outgoing transaction created successfully
 */
router.post('/inventory/outgoing/', createOutgoingTransaction);

/**
 * @swagger
 * /inventory/outgoing:
 *   get:
 *     summary: Get all outgoing transactions
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: List of outgoing transactions
 */
router.get('/inventory/outgoing/', getOutgoingTransactions);

/**
 * @swagger
 * /inventory/outgoing/{id}:
 *   get:
 *     summary: Get outgoing transaction by ID with details
 *     tags: [Inventory]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Outgoing transaction details
 */
router.get('/inventory/outgoing/:id', getOutgoingTransactionById);

// =====================================================
// STOCK MANAGEMENT ROUTES
// =====================================================

/**
 * @swagger
 * /inventory/stock:
 *   get:
 *     summary: Get current stock with status
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: Current stock information
 */
router.get('/inventory/stock/', getCurrentStock);

/**
 * @swagger
 * /inventory/stock/low:
 *   get:
 *     summary: Get items with low stock
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: Items with low stock
 */
router.get('/inventory/stock/low', getLowStockItems);

/**
 * @swagger
 * /inventory/stock/{supply_id}:
 *   get:
 *     summary: Get stock by supply ID
 *     tags: [Inventory]
 *     parameters:
 *       - name: supply_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Stock details for specific supply
 */
router.get('/inventory/stock/:supply_id', getStockBySupplyId);

/**
 * @swagger
 * /inventory/movements:
 *   get:
 *     summary: Get inventory movements (Kardex)
 *     tags: [Inventory]
 *     parameters:
 *       - name: supply_id
 *         in: query
 *         schema:
 *           type: integer
 *       - name: start_date
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *       - name: end_date
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *       - name: movement_type
 *         in: query
 *         schema:
 *           type: string
 *           enum: [INCOMING, OUTGOING, ADJUSTMENT]
 *     responses:
 *       200:
 *         description: Inventory movements
 */
router.get('/inventory/movements/', getInventoryMovements);

// =====================================================
// SUPPLIERS ROUTES
// =====================================================

/**
 * @swagger
 * /inventory/suppliers:
 *   post:
 *     summary: Create a new supplier
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               business_name:
 *                 type: string
 *               tax_id:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               main_contact:
 *                 type: string
 *     responses:
 *       201:
 *         description: Supplier created successfully
 */
router.post('/inventory/suppliers/', createSupplier);

/**
 * @swagger
 * /inventory/suppliers:
 *   get:
 *     summary: Get all suppliers
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: List of suppliers
 */
router.get('/inventory/suppliers/', getSuppliers);


/**
 * @swagger
 * /inventory/suppliers/{filterField}/{value}:
 *   get:
 *     summary: Get supplier by multiple filters
 *     tags: [Inventory]
 *     parameters:
 *       - name: filterField
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           enum: [id, code, name, business_name]
 *         description: Filter field to search by
 *       - name: value
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Value to search for
 *     responses:
 *       200:
 *         description: Supplier details
 *       400:
 *         description: Invalid filter
 *       404:
 *         description: Supplier not found
 */
router.get('/inventory/suppliers/:filterField/:value', getSupplierById);

// =====================================================
// CATEGORIES AND UNITS ROUTES
// =====================================================

/**
 * @swagger
 * /inventory/categories:
 *   get:
 *     summary: Get supply categories
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: List of supply categories
 */
router.get('/inventory/categories/', getSupplyCategories);

/**
 * @swagger
 * /inventory/units:
 *   get:
 *     summary: Get units of measure
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: List of units of measure
 */
router.get('/inventory/units/', getUnitsOfMeasure);

export default router; 