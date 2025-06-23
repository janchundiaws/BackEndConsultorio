-- Tenants table
CREATE TABLE tenants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table (receptionists, doctors, admins, etc.)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role VARCHAR(50) CHECK (role IN ('admin', 'receptionist', 'dentist')) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Specialties table
CREATE TABLE specialties (
  id SERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL
);

-- Dentists table
CREATE TABLE dentists (
  id SERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  specialty_id INTEGER REFERENCES specialties(id),
  phone VARCHAR(20),
  email VARCHAR(100)
);

-- Patients table
CREATE TABLE patients (
  id SERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  national_id VARCHAR(20) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  birth_date DATE,
  gender VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Offices (consulting rooms) table
CREATE TABLE offices (
  id SERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name VARCHAR(50) NOT NULL,
  location TEXT
);

-- Appointments table
CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL,
  patient_id INTEGER REFERENCES patients(id),
  dentist_id INTEGER REFERENCES dentists(id),
  office_id INTEGER REFERENCES offices(id),
  appointment_time TIMESTAMP NOT NULL,
  status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
  reason TEXT
);

-- Treatments table
CREATE TABLE treatments (
  id SERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL,
  appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  cost NUMERIC(10, 2),
  completed BOOLEAN DEFAULT FALSE
);

-- Clinical history table
CREATE TABLE clinical_history (
  id SERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL,
  patient_id INTEGER REFERENCES patients(id),
  observation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clinical history attachments
CREATE TABLE clinical_history_attachments (
  id SERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL,
  history_id INTEGER REFERENCES clinical_history(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100),
  base64_content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
