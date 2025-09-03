# Consultorio Odontológico - Backend API

Una API REST completa para la gestión de un consultorio odontológico, desarrollada con Node.js, Express.js y PostgreSQL. Incluye autenticación JWT, multi-tenancy, y documentación Swagger.

## 🚀 Características

- **Autenticación JWT** con roles de usuario
- **Multi-tenancy** para múltiples consultorios
- **API RESTful** completa con validaciones
- **Documentación Swagger** integrada
- **Gestión de inventario** con control de stock
- **Sistema de citas** con validaciones de horarios
- **Historial clínico** con archivos adjuntos
- **Gestión de tratamientos** médicos
- **Estadísticas** y reportes

## 📋 Requisitos

- Node.js (v14 o superior)
- PostgreSQL (v12 o superior)
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio:**
```bash
git clone <repository-url>
cd BackEndConsultorio
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar base de datos:**
   - Crear una base de datos PostgreSQL
   - Ejecutar el script `database/db.sql` para crear las tablas
   - Ejecutar el script `database/inventory_schema.sql` para el esquema de inventario

4. **Configurar variables de entorno:**
   - Copiar `.env.template` a `.env`
   - Configurar las variables de base de datos:
```env
DB_USER=your_username
DB_PASSWORD=your_password
DB_HOST=your_host
DB_PORT=your_port
DB_DATABASE=your_database
PORT=3000
```

5. **Ejecutar el servidor:**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📚 Documentación API

La documentación completa de la API está disponible en Swagger UI:
- **URL:** `http://localhost:3000/api-docs`
- **Formato:** OpenAPI 3.0

## 🔐 Autenticación

La API utiliza autenticación JWT. Para acceder a los endpoints protegidos:

```bash
# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

# Usar token en headers
Authorization: Bearer <jwt_token>
```

## 📊 Módulos Implementados

### 👥 **Usuarios**
- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario por ID
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### 🏥 **Pacientes**
- `GET /api/patients` - Listar pacientes
- `GET /api/patients/:filterField/:value` - Buscar paciente (ID, documento, nombre)
- `POST /api/patients` - Crear paciente
- `PUT /api/patients/:id` - Actualizar paciente
- `DELETE /api/patients/:id` - Eliminar paciente

### 📅 **Citas (Appointments)**
- `GET /api/appointments` - Listar citas (con filtros)
- `GET /api/appointments/patient/:id` - Citas por paciente
- `GET /api/appointments/dentist/:id` - Citas por dentista
- `GET /api/appointments/:id` - Obtener cita específica
- `POST /api/appointments` - Crear cita
- `PUT /api/appointments/:id` - Actualizar cita
- `DELETE /api/appointments/:id` - Eliminar cita
- `GET /api/appointments/stats/summary` - Estadísticas de citas

### 🏥 **Tratamientos**
- `GET /api/treatments` - Listar tratamientos (con filtros)
- `GET /api/treatments/appointment/:id` - Tratamientos por cita
- `GET /api/treatments/patient/:id` - Tratamientos por paciente
- `GET /api/treatments/:id` - Obtener tratamiento específico
- `POST /api/treatments` - Crear tratamiento
- `PUT /api/treatments/:id` - Actualizar tratamiento
- `DELETE /api/treatments/:id` - Eliminar tratamiento
- `PATCH /api/treatments/:id/complete` - Marcar como completado
- `GET /api/treatments/stats/summary` - Estadísticas de tratamientos

### 📋 **Historial Clínico**
- `GET /api/clinical-history` - Listar historiales
- `GET /api/clinical-history/patient/:id` - Historiales por paciente
- `GET /api/clinical-history/:id` - Obtener historial específico
- `POST /api/clinical-history` - Crear historial
- `PUT /api/clinical-history/:id` - Actualizar historial
- `DELETE /api/clinical-history/:id` - Eliminar historial

### 📎 **Archivos Adjuntos (Clinical History)**
- `POST /api/clinical-history/:id/attachments` - Crear adjunto
- `GET /api/clinical-history/:id/attachments` - Listar adjuntos
- `GET /api/clinical-history/attachments/:id` - Obtener adjunto
- `PUT /api/clinical-history/attachments/:id` - Actualizar adjunto
- `DELETE /api/clinical-history/attachments/:id` - Eliminar adjunto
- `GET /api/clinical-history/:id/with-attachments` - Historial con adjuntos

### 📦 **Inventario**
- `GET /api/inventory/supplies` - Listar insumos
- `GET /api/inventory/supplies/:id` - Obtener insumo
- `POST /api/inventory/supplies` - Crear insumo
- `PUT /api/inventory/supplies/:id` - Actualizar insumo
- `DELETE /api/inventory/supplies/:id` - Eliminar insumo

### 📥 **Transacciones de Entrada**
- `GET /api/inventory/incoming` - Listar transacciones de entrada
- `GET /api/inventory/incoming/:id` - Obtener transacción
- `POST /api/inventory/incoming` - Crear transacción de entrada

### 📤 **Transacciones de Salida**
- `GET /api/inventory/outgoing` - Listar transacciones de salida
- `GET /api/inventory/outgoing/:id` - Obtener transacción
- `POST /api/inventory/outgoing` - Crear transacción de salida

### 📊 **Control de Stock**
- `GET /api/inventory/stock/current` - Stock actual
- `GET /api/inventory/stock/low` - Productos con stock bajo
- `GET /api/inventory/stock/movements` - Movimientos de inventario
- `GET /api/inventory/stock/supply/:id` - Stock por insumo

### 🏢 **Proveedores**
- `GET /api/inventory/suppliers` - Listar proveedores
- `GET /api/inventory/suppliers/:filterField/:value` - Buscar proveedor
- `POST /api/inventory/suppliers` - Crear proveedor
- `PUT /api/inventory/suppliers/:id` - Actualizar proveedor

### ⚙️ **Configuración**
- `GET /api/bloodType` - Tipos de sangre
- `GET /api/documentType` - Tipos de documento
- `GET /api/dentists` - Dentistas
- `GET /api/offices` - Oficinas/Consultorios
- `GET /api/maritalStatus` - Estados civiles
- `GET /api/estadisticas` - Estadísticas generales

## 🔍 Filtros y Parámetros

### **Filtros Comunes:**
- `page` - Número de página (default: 1)
- `limit` - Resultados por página (default: 50)
- `date_from` - Fecha desde (YYYY-MM-DD)
- `date_to` - Fecha hasta (YYYY-MM-DD)

### **Filtros Específicos:**
- **Citas:** `patient_id`, `dentist_id`, `office_id`, `status`
- **Tratamientos:** `appointment_id`, `completed`, `cost_min`, `cost_max`
- **Inventario:** `category`, `supplier_id`, `low_stock`

## 🏗️ Estructura del Proyecto

```
src/
├── controllers/          # Controladores de la API
│   ├── appointments.controller.js
│   ├── clinicalHistory.controller.js
│   ├── config.controller.js
│   ├── inventory.controller.js
│   ├── patients.controller.js
│   ├── treatments.controller.js
│   └── users.controller.js
├── routes/              # Rutas de la API
│   ├── appointments.routes.js
│   ├── clinicalHistory.routes.js
│   ├── config.routes.js
│   ├── inventory.routes.js
│   ├── patients.routes.js
│   ├── treatments.routes.js
│   └── users.routes.js
├── middlewares/         # Middlewares personalizados
│   ├── auth.middleware.js
│   └── tenant.middleware.js
├── helpers/            # Funciones auxiliares
│   ├── jwt.js
│   └── tokenBlacklist.js
├── config.js           # Configuración
├── db.js              # Conexión a base de datos
├── index.js           # Punto de entrada
└── swagger.js         # Configuración Swagger

database/
├── db.sql             # Esquema principal
└── inventory_schema.sql # Esquema de inventario
```

## 🗄️ Base de Datos

### **Esquemas:**
- `config` - Configuraciones generales
- `office` - Datos del consultorio
- `inventory` - Gestión de inventario
- `identity` - Usuarios y autenticación

### **Tablas Principales:**
- `tenants` - Multi-tenancy
- `users` - Usuarios del sistema
- `patients` - Pacientes
- `appointments` - Citas médicas
- `treatments` - Tratamientos
- `clinical_history` - Historial clínico
- `clinical_history_attachments` - Archivos adjuntos
- `master_supplies` - Insumos médicos
- `suppliers` - Proveedores
- `incoming_transactions` - Entradas de inventario
- `outgoing_transactions` - Salidas de inventario

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Producción
npm start

# Linting
npm run lint

# Verificar sintaxis
npm run check
```

## 🚀 Despliegue

### **Variables de Entorno Requeridas:**
```env
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=consultorio_db
PORT=3000
```

### **Docker (Opcional):**
```bash
# Usar docker-compose.yml incluido
docker-compose up -d
```

## 📈 Características Avanzadas

- **Multi-tenancy** - Soporte para múltiples consultorios
- **Validaciones robustas** - Validación de datos y referencias
- **Paginación** - Para listas grandes de datos
- **Filtros avanzados** - Búsquedas flexibles
- **Estadísticas** - Métricas y reportes
- **Control de stock** - Gestión automática de inventario
- **Archivos adjuntos** - Almacenamiento en base64
- **Auditoría** - Timestamps automáticos

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas:
- Crear un issue en GitHub
- Contactar al equipo de desarrollo

---

**Desarrollado con ❤️ para la gestión eficiente de consultorios odontológicos**