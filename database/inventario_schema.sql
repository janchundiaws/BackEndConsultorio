-- =====================================================
-- INVENTORY SCHEMA FOR DENTAL DISPENSARY
-- =====================================================

-- Create inventory schema
CREATE SCHEMA IF NOT EXISTS inventory;

-- Set default schema
SET search_path TO inventory, public;

-- =====================================================
-- MASTER SUPPLIES TABLE (PRODUCT CATALOG)
-- =====================================================
CREATE TABLE IF NOT EXISTS inventory.master_supplies (
    supply_id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES config.tenants(id),
    code VARCHAR(20) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL, -- Ex: Restoration Materials, Anesthetics, etc.
    unit_measure VARCHAR(20) NOT NULL, -- Ex: units, ml, mg, etc.
    presentation VARCHAR(100), -- Ex: Box of 50, Bottle of 30ml, etc.
    unit_cost DECIMAL(10,2) DEFAULT 0.00,
    sale_price DECIMAL(10,2) DEFAULT 0.00,
    min_stock INTEGER DEFAULT 0,
    max_stock INTEGER DEFAULT 0,
    main_supplier VARCHAR(200),
    warehouse_location VARCHAR(100), -- Physical location in warehouse
    status BOOLEAN DEFAULT TRUE, -- TRUE = Active, FALSE = Inactive
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    UNIQUE(tenant_id, code)
);

-- =====================================================
-- SUPPLIERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS inventory.suppliers (
    supplier_id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES config.tenants(id),
    code VARCHAR(20) NOT NULL,
    name VARCHAR(200) NOT NULL,
    business_name VARCHAR(200),
    tax_id VARCHAR(20),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    main_contact VARCHAR(100),
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, code)
);

-- =====================================================
-- INCOMING TRANSACTIONS TABLE (PURCHASES/ENTRIES)
-- =====================================================
CREATE TABLE IF NOT EXISTS inventory.incoming_transactions (
    incoming_id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES config.tenants(id),
    transaction_number VARCHAR(20) NOT NULL,
    transaction_date DATE NOT NULL,
    supplier_id INTEGER REFERENCES inventory.suppliers(supplier_id),
    invoice_number VARCHAR(50),
    transaction_type VARCHAR(50) NOT NULL, -- PURCHASE, DONATION, RETURN, etc.
    subtotal DECIMAL(12,2) DEFAULT 0.00,
    tax_amount DECIMAL(12,2) DEFAULT 0.00,
    total DECIMAL(12,2) DEFAULT 0.00,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    UNIQUE(tenant_id, transaction_number)
);

-- =====================================================
-- INCOMING TRANSACTIONS DETAIL TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS inventory.incoming_details (
    detail_id SERIAL PRIMARY KEY,
    incoming_id INTEGER REFERENCES inventory.incoming_transactions(incoming_id) ON DELETE CASCADE,
    supply_id INTEGER REFERENCES inventory.master_supplies(supply_id),
    quantity DECIMAL(10,3) NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    batch_number VARCHAR(50), -- Product batch number
    expiration_date DATE,
    warehouse_location VARCHAR(100),
    notes TEXT
);

-- =====================================================
-- OUTGOING TRANSACTIONS TABLE (SALES/CONSUMPTION)
-- =====================================================
CREATE TABLE IF NOT EXISTS inventory.outgoing_transactions (
    outgoing_id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES config.tenants(id),
    transaction_number VARCHAR(20) NOT NULL,
    transaction_date DATE NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- CONSUMPTION, SALE, LOSS, ADJUSTMENT, etc.
    patient_id INTEGER, -- Reference to patient (if applicable)
    dentist_id INTEGER, -- Reference to dentist (if applicable)
    reason TEXT,
    total DECIMAL(12,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    UNIQUE(tenant_id, transaction_number)
);

-- =====================================================
-- OUTGOING TRANSACTIONS DETAIL TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS inventory.outgoing_details (
    detail_id SERIAL PRIMARY KEY,
    outgoing_id INTEGER REFERENCES inventory.outgoing_transactions(outgoing_id) ON DELETE CASCADE,
    supply_id INTEGER REFERENCES inventory.master_supplies(supply_id),
    quantity DECIMAL(10,3) NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    batch_number VARCHAR(50), -- Specific batch being consumed
    notes TEXT
);

-- =====================================================
-- CURRENT STOCK TABLE (BALANCES)
-- =====================================================
CREATE TABLE IF NOT EXISTS inventory.current_stock (
    stock_id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES config.tenants(id),
    supply_id INTEGER REFERENCES inventory.master_supplies(supply_id),
    batch_number VARCHAR(50),
    available_quantity DECIMAL(10,3) DEFAULT 0,
    reserved_quantity DECIMAL(10,3) DEFAULT 0,
    total_quantity DECIMAL(10,3) DEFAULT 0,
    average_cost DECIMAL(10,2) DEFAULT 0.00,
    expiration_date DATE,
    warehouse_location VARCHAR(100),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, supply_id, batch_number)
);

-- =====================================================
-- INVENTORY MOVEMENTS TABLE (KARDEX)
-- =====================================================
CREATE TABLE IF NOT EXISTS inventory.inventory_movements (
    movement_id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES config.tenants(id),
    movement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    supply_id INTEGER REFERENCES inventory.master_supplies(supply_id),
    batch_number VARCHAR(50),
    movement_type VARCHAR(20) NOT NULL, -- INCOMING, OUTGOING, ADJUSTMENT
    quantity DECIMAL(10,3) NOT NULL,
    previous_balance DECIMAL(10,3) NOT NULL,
    new_balance DECIMAL(10,3) NOT NULL,
    unit_cost DECIMAL(10,2),
    reference_number VARCHAR(50), -- Incoming/outgoing transaction number
    reference_id INTEGER, -- Reference table ID
    notes TEXT,
    user_movement VARCHAR(50)
);

-- =====================================================
-- INVENTORY ADJUSTMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS inventory.inventory_adjustments (
    adjustment_id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES config.tenants(id),
    adjustment_number VARCHAR(20) NOT NULL,
    adjustment_date DATE NOT NULL,
    adjustment_type VARCHAR(50) NOT NULL, -- INCREASE, DECREASE, CORRECTION
    adjustment_reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    UNIQUE(tenant_id, adjustment_number)
);

-- =====================================================
-- ADJUSTMENT DETAILS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS inventory.adjustment_details (
    detail_id SERIAL PRIMARY KEY,
    adjustment_id INTEGER REFERENCES inventory.inventory_adjustments(adjustment_id) ON DELETE CASCADE,
    supply_id INTEGER REFERENCES inventory.master_supplies(supply_id),
    batch_number VARCHAR(50),
    previous_quantity DECIMAL(10,3) NOT NULL,
    new_quantity DECIMAL(10,3) NOT NULL,
    difference DECIMAL(10,3) NOT NULL,
    unit_cost DECIMAL(10,2),
    notes TEXT
);

-- =====================================================
-- SUPPLY CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS inventory.supply_categories (
    category_id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES config.tenants(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, name)
);

-- =====================================================
-- UNITS OF MEASURE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS inventory.units_of_measure (
    unit_id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES config.tenants(id),
    name VARCHAR(20) NOT NULL,
    description TEXT,
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, name)
);

-- =====================================================
-- INDEXES FOR QUERY OPTIMIZATION
-- =====================================================

-- Indexes for master_supplies
CREATE INDEX idx_master_supplies_tenant ON inventory.master_supplies(tenant_id);
CREATE INDEX idx_master_supplies_code ON inventory.master_supplies(tenant_id, code);
CREATE INDEX idx_master_supplies_category ON inventory.master_supplies(tenant_id, category);
CREATE INDEX idx_master_supplies_status ON inventory.master_supplies(tenant_id, status);

-- Indexes for suppliers
CREATE INDEX idx_suppliers_tenant ON inventory.suppliers(tenant_id);
CREATE INDEX idx_suppliers_code ON inventory.suppliers(tenant_id, code);

-- Indexes for incoming_transactions
CREATE INDEX idx_incoming_tenant ON inventory.incoming_transactions(tenant_id);
CREATE INDEX idx_incoming_date ON inventory.incoming_transactions(tenant_id, transaction_date);
CREATE INDEX idx_incoming_supplier ON inventory.incoming_transactions(tenant_id, supplier_id);
CREATE INDEX idx_incoming_status ON inventory.incoming_transactions(tenant_id, status);

-- Indexes for outgoing_transactions
CREATE INDEX idx_outgoing_tenant ON inventory.outgoing_transactions(tenant_id);
CREATE INDEX idx_outgoing_date ON inventory.outgoing_transactions(tenant_id, transaction_date);
CREATE INDEX idx_outgoing_type ON inventory.outgoing_transactions(tenant_id, transaction_type);
CREATE INDEX idx_outgoing_status ON inventory.outgoing_transactions(tenant_id, status);

-- Indexes for current_stock
CREATE INDEX idx_current_stock_tenant ON inventory.current_stock(tenant_id);
CREATE INDEX idx_current_stock_supply ON inventory.current_stock(tenant_id, supply_id);
CREATE INDEX idx_current_stock_batch ON inventory.current_stock(tenant_id, batch_number);
CREATE INDEX idx_current_stock_expiration ON inventory.current_stock(tenant_id, expiration_date);

-- Indexes for inventory_movements
CREATE INDEX idx_movements_tenant ON inventory.inventory_movements(tenant_id);
CREATE INDEX idx_movements_date ON inventory.inventory_movements(tenant_id, movement_date);
CREATE INDEX idx_movements_supply ON inventory.inventory_movements(tenant_id, supply_id);
CREATE INDEX idx_movements_type ON inventory.inventory_movements(tenant_id, movement_type);

-- Indexes for inventory_adjustments
CREATE INDEX idx_adjustments_tenant ON inventory.inventory_adjustments(tenant_id);
CREATE INDEX idx_adjustments_date ON inventory.inventory_adjustments(tenant_id, adjustment_date);

-- Indexes for supply_categories
CREATE INDEX idx_categories_tenant ON inventory.supply_categories(tenant_id);
CREATE INDEX idx_categories_name ON inventory.supply_categories(tenant_id, name);

-- Indexes for units_of_measure
CREATE INDEX idx_units_tenant ON inventory.units_of_measure(tenant_id);
CREATE INDEX idx_units_name ON inventory.units_of_measure(tenant_id, name);

-- =====================================================
-- TRIGGERS FOR DATA INTEGRITY
-- =====================================================

-- Trigger to update updated_at in master_supplies
CREATE OR REPLACE FUNCTION inventory.update_modified_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_master_supplies_modification
    BEFORE UPDATE ON inventory.master_supplies
    FOR EACH ROW
    EXECUTE FUNCTION inventory.update_modified_date();

-- Trigger to update stock after incoming transactions
CREATE OR REPLACE FUNCTION inventory.update_stock_incoming()
RETURNS TRIGGER AS $$
DECLARE
    tenant_uuid UUID;
BEGIN
    -- Get tenant_id from incoming transaction
    SELECT tenant_id INTO tenant_uuid FROM inventory.incoming_transactions WHERE incoming_id = NEW.incoming_id;
    
    -- Insert or update stock
    INSERT INTO inventory.current_stock (tenant_id, supply_id, batch_number, available_quantity, total_quantity, average_cost, expiration_date, warehouse_location)
    VALUES (tenant_uuid, NEW.supply_id, NEW.batch_number, NEW.quantity, NEW.quantity, NEW.unit_cost, NEW.expiration_date, NEW.warehouse_location)
    ON CONFLICT (tenant_id, supply_id, batch_number)
    DO UPDATE SET
        available_quantity = inventory.current_stock.available_quantity + NEW.quantity,
        total_quantity = inventory.current_stock.total_quantity + NEW.quantity,
        average_cost = (inventory.current_stock.average_cost * inventory.current_stock.total_quantity + NEW.unit_cost * NEW.quantity) / (inventory.current_stock.total_quantity + NEW.quantity),
        last_updated = CURRENT_TIMESTAMP;
    
    -- Register movement
    INSERT INTO inventory.inventory_movements (tenant_id, supply_id, batch_number, movement_type, quantity, previous_balance, new_balance, unit_cost, reference_number, reference_id)
    SELECT 
        tenant_uuid,
        NEW.supply_id,
        NEW.batch_number,
        'INCOMING',
        NEW.quantity,
        COALESCE((SELECT total_quantity FROM inventory.current_stock WHERE tenant_id = tenant_uuid AND supply_id = NEW.supply_id AND batch_number = NEW.batch_number), 0),
        COALESCE((SELECT total_quantity FROM inventory.current_stock WHERE tenant_id = tenant_uuid AND supply_id = NEW.supply_id AND batch_number = NEW.batch_number), 0) + NEW.quantity,
        NEW.unit_cost,
        (SELECT transaction_number FROM inventory.incoming_transactions WHERE incoming_id = NEW.incoming_id),
        NEW.incoming_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_incoming_stock
    AFTER INSERT ON inventory.incoming_details
    FOR EACH ROW
    EXECUTE FUNCTION inventory.update_stock_incoming();

-- Trigger to update stock after outgoing transactions
CREATE OR REPLACE FUNCTION inventory.update_stock_outgoing()
RETURNS TRIGGER AS $$
DECLARE
    available_stock DECIMAL(10,3);
    tenant_uuid UUID;
BEGIN
    -- Get tenant_id from outgoing transaction
    SELECT tenant_id INTO tenant_uuid FROM inventory.outgoing_transactions WHERE outgoing_id = NEW.outgoing_id;
    
    -- Check available stock
    SELECT available_quantity INTO available_stock
    FROM inventory.current_stock
    WHERE tenant_id = tenant_uuid AND supply_id = NEW.supply_id AND batch_number = NEW.batch_number;
    
    IF available_stock < NEW.quantity THEN
        RAISE EXCEPTION 'Insufficient stock for supply %', NEW.supply_id;
    END IF;
    
    -- Update stock
    UPDATE inventory.current_stock
    SET 
        available_quantity = available_quantity - NEW.quantity,
        last_updated = CURRENT_TIMESTAMP
    WHERE tenant_id = tenant_uuid AND supply_id = NEW.supply_id AND batch_number = NEW.batch_number;
    
    -- Register movement
    INSERT INTO inventory.inventory_movements (tenant_id, supply_id, batch_number, movement_type, quantity, previous_balance, new_balance, unit_cost, reference_number, reference_id)
    SELECT 
        tenant_uuid,
        NEW.supply_id,
        NEW.batch_number,
        'OUTGOING',
        NEW.quantity,
        available_stock,
        available_stock - NEW.quantity,
        NEW.unit_cost,
        (SELECT transaction_number FROM inventory.outgoing_transactions WHERE outgoing_id = NEW.outgoing_id),
        NEW.outgoing_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_outgoing_stock
    AFTER INSERT ON inventory.outgoing_details
    FOR EACH ROW
    EXECUTE FUNCTION inventory.update_stock_outgoing();

-- =====================================================
-- USEFUL VIEWS FOR REPORTS
-- =====================================================

-- Current stock view with complete information
CREATE OR REPLACE VIEW inventory.current_stock_view AS
SELECT 
    s.stock_id,
    s.tenant_id,
    i.code,
    i.name,
    i.category,
    i.unit_measure,
    s.batch_number,
    s.available_quantity,
    s.reserved_quantity,
    s.total_quantity,
    s.average_cost,
    s.expiration_date,
    s.warehouse_location,
    i.min_stock,
    i.max_stock,
    CASE 
        WHEN s.available_quantity <= i.min_stock THEN 'CRITICAL'
        WHEN s.available_quantity <= (i.min_stock * 1.5) THEN 'LOW'
        ELSE 'NORMAL'
    END as stock_status,
    s.last_updated
FROM inventory.current_stock s
JOIN inventory.master_supplies i ON s.supply_id = i.supply_id AND s.tenant_id = i.tenant_id
WHERE i.status = TRUE;

-- Recent movements view
CREATE OR REPLACE VIEW inventory.recent_movements_view AS
SELECT 
    m.movement_date,
    m.tenant_id,
    i.code,
    i.name,
    m.batch_number,
    m.movement_type,
    m.quantity,
    m.previous_balance,
    m.new_balance,
    m.unit_cost,
    m.reference_number,
    m.notes,
    m.user_movement
FROM inventory.inventory_movements m
JOIN inventory.master_supplies i ON m.supply_id = i.supply_id AND m.tenant_id = i.tenant_id
ORDER BY m.movement_date DESC;

-- Low stock products view
CREATE OR REPLACE VIEW inventory.low_stock_view AS
SELECT 
    i.tenant_id,
    i.code,
    i.name,
    i.category,
    i.unit_measure,
    COALESCE(SUM(s.available_quantity), 0) as current_stock,
    i.min_stock,
    i.main_supplier,
    i.warehouse_location
FROM inventory.master_supplies i
LEFT JOIN inventory.current_stock s ON i.supply_id = s.supply_id AND i.tenant_id = s.tenant_id
WHERE i.status = TRUE
GROUP BY i.tenant_id, i.supply_id, i.code, i.name, i.category, i.unit_measure, i.min_stock, i.main_supplier, i.warehouse_location
HAVING COALESCE(SUM(s.available_quantity), 0) <= i.min_stock;

-- =====================================================
-- INITIAL DATA (OPTIONAL)
-- =====================================================

-- Insert basic categories (will be inserted per tenant when created)
-- INSERT INTO inventory.supply_categories (tenant_id, name, description) VALUES
-- ('tenant-uuid-here', 'Restoration Materials', 'Amalgams, composites, cements'),
-- ('tenant-uuid-here', 'Anesthetics', 'Local anesthetics and vasoconstrictors'),
-- ('tenant-uuid-here', 'Instruments', 'Burs, mirrors, explorers'),
-- ('tenant-uuid-here', 'Impression Materials', 'Alginates, silicones'),
-- ('tenant-uuid-here', 'Medications', 'Analgesics, anti-inflammatories'),
-- ('tenant-uuid-here', 'Hygiene Materials', 'Gloves, masks, gowns'),
-- ('tenant-uuid-here', 'Equipment', 'Dental equipment and devices');

-- Insert basic units of measure (will be inserted per tenant when created)
-- INSERT INTO inventory.units_of_measure (tenant_id, name, description) VALUES
-- ('tenant-uuid-here', 'unit', 'Individual unit'),
-- ('tenant-uuid-here', 'ml', 'Milliliters'),
-- ('tenant-uuid-here', 'mg', 'Milligrams'),
-- ('tenant-uuid-here', 'g', 'Grams'),
-- ('tenant-uuid-here', 'box', 'Product box'),
-- ('tenant-uuid-here', 'bottle', 'Bottle or container'),
-- ('tenant-uuid-here', 'roll', 'Material roll'),
-- ('tenant-uuid-here', 'pack', 'Product pack');

-- =====================================================
-- FINAL COMMENTS
-- =====================================================

COMMENT ON SCHEMA inventory IS 'Schema for dental dispensary inventory management';
COMMENT ON TABLE inventory.master_supplies IS 'Master catalog of all dental supplies';
COMMENT ON TABLE inventory.current_stock IS 'Current inventory balances by batch';
COMMENT ON TABLE inventory.inventory_movements IS 'Record of all inventory movements (Kardex)';

-- =====================================================
-- END OF SCRIPT
-- ===================================================== 