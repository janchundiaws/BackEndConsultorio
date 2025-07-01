-- Tenants table
CREATE TABLE config.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  local_id INTEGER NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  status INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_tenants_status CHECK (status IN (0, 1))
);

-- Users table (receptionists, doctors, admins, etc.)
CREATE TABLE IDENTITY.users (
  id SERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role VARCHAR(50) CHECK (role IN ('admin', 'receptionist', 'dentist')) NOT NULL,
  status INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_users_status CHECK (status IN (0, 1))
);

--tipo documento
create table config.document_type (
  id VARCHAR(2) NOT NULL PRIMARY KEY,
  name VARCHAR(100),
  status INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_document_status CHECK (status IN (0, 1))
);
 
insert into config.document_type (id, name)
values ('1', 'CÉDULA'),
       ('2', 'RUC'),
       ('3', 'PASAPORTE'),
       ('4', 'CONSUMIDOR FINAL'),
       ('5', 'ID DEL EXTERIOR'),
       ('6', 'PLACA');

--estado civil
create table config.marital_status (
  id VARCHAR(2) NOT NULL PRIMARY KEY,
  name VARCHAR(100),
  status INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_marital_status CHECK (status IN (0, 1))
);

insert into config.marital_status (id, name)
values ('1', 'No Se Conoce'),
       ('2', 'Soltero(a)'),
       ('3', 'Casado(a)'),
       ('4', 'Viudo(a)'),
       ('5', 'Divorciado(a)'),
       ('6', 'Unión Libre');
    
-- tipo de sangre
create table config.blood_type (
  id VARCHAR(2) NOT NULL PRIMARY KEY,
  name VARCHAR(100),
  status INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_blood_type_status CHECK (status IN (0, 1))
);
 
insert into config.blood_type (id, name)
values ('1', 'A+'),
       ('2', 'A-'),
       ('3', 'B+'),
       ('4', 'B-'),
       ('5', 'O+'),
       ('6', 'O-'),
       ('7', 'AB+'),
       ('8', 'AB-');
     

-- Specialties table
CREATE TABLE config.specialties (
  id SERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL
);

-- Dentists table
CREATE TABLE config.dentists (
  id SERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  specialty_id INTEGER REFERENCES config.specialties(id),
  phone VARCHAR(20),
  email VARCHAR(100)
);

-- Patients table
CREATE TABLE office.patients (
  id SERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES config.tenants(tenant_id),
  document_type_id VARCHAR(2) REFERENCES config.document_type(id),
  document_id VARCHAR(20),
  name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  phone VARCHAR(30),
  address TEXT,
  email VARCHAR(50),
  birth_date DATE,
  gender VARCHAR(1),
  marital_status_id VARCHAR(2) REFERENCES config.marital_status(id),
  blood_type_id VARCHAR(2) REFERENCES config.blood_type(id),
  occupation VARCHAR(100),
  status INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_patients CHECK (status IN (0, 1))
);


-- Offices (consulting rooms) table
CREATE TABLE config.offices (
  id SERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name VARCHAR(50) NOT NULL,
  location TEXT
);

-- Appointments table
CREATE TABLE office.appointments (
  id SERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL,
  patient_id INTEGER REFERENCES office.patients(id),
  dentist_id INTEGER REFERENCES config.dentists(id),
  office_id INTEGER REFERENCES config.offices(id),
  appointment_time TIMESTAMP NOT NULL,
  status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
  reason TEXT
);

-- Treatments table
CREATE TABLE office.treatments (
  id SERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL,
  appointment_id INTEGER REFERENCES office.appointments(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  cost NUMERIC(10, 2),
  completed BOOLEAN DEFAULT FALSE
);

-- Clinical history table
CREATE TABLE office.clinical_history (
  id SERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL,
  patient_id INTEGER REFERENCES office.patients(id),
  observation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clinical history attachments
CREATE TABLE office.clinical_history_attachments (
  id SERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL,
  history_id INTEGER REFERENCES office.clinical_history(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100),
  base64_content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

