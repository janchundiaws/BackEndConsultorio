# Health Check Endpoint

## Descripción

El endpoint `/api/health` es un endpoint especializado diseñado para verificaciones de salud del servidor. Es parte de las mejores prácticas de APIs REST y proporciona información rápida sobre el estado del sistema.

## ¿Por qué usarlo?

- **Endpoint especializado**: Diseñado específicamente para verificaciones de salud
- **Respuesta rápida**: No realiza operaciones complejas, solo confirma que el servidor responde
- **Estándar de la industria**: Patrón común en APIs REST para health checks
- **Ligero**: No requiere autenticación ni procesa datos pesados
- **Monitoreo**: Permite a herramientas externas verificar el estado del servicio

## Uso

### URL
```
GET /api/health
```

### Headers mínimos
```
Content-Type: application/json
```

### Ejemplo de uso con curl
```bash
curl -X GET http://localhost:3000/api/health \
  -H "Content-Type: application/json"
```

### Ejemplo de uso con JavaScript/Fetch
```javascript
const baseUrl = 'http://localhost:3000';

fetch(`${baseUrl}/api/health`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

### Ejemplo de uso con Dart/Flutter
```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<void> checkHealth() async {
  final baseUrl = 'http://localhost:3000';
  final uri = Uri.parse('$baseUrl/api/health');
  
  try {
    final response = await http.get(
      uri,
      headers: {
        'Content-Type': 'application/json',
      },
    );
    
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      print('Servidor funcionando: ${data['status']}');
    } else {
      print('Error en el servidor: ${response.statusCode}');
    }
  } catch (e) {
    print('Error de conexión: $e');
  }
}
```

## Respuestas

### Respuesta exitosa (200)
```json
{
  "status": "OK",
  "message": "Servidor funcionando correctamente",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "database": {
    "status": "OK"
  },
  "version": "1.0.0"
}
```

### Respuesta degradada (503)
```json
{
  "status": "DEGRADED",
  "message": "Servidor funcionando pero con problemas en la base de datos",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "database": {
    "status": "ERROR"
  },
  "version": "1.0.0"
}
```

### Error interno (500)
```json
{
  "status": "ERROR",
  "message": "Error interno del servidor",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Campos de respuesta

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `status` | string | Estado general del servidor (`OK`, `DEGRADED`, `ERROR`) |
| `message` | string | Mensaje descriptivo del estado |
| `timestamp` | string | Fecha y hora de la verificación (ISO 8601) |
| `uptime` | number | Tiempo de funcionamiento del servidor en segundos |
| `database.status` | string | Estado de la conexión a la base de datos |
| `version` | string | Versión de la aplicación |

## Códigos de estado HTTP

- **200**: Servidor y base de datos funcionando correctamente
- **503**: Servidor funcionando pero con problemas en la base de datos
- **500**: Error interno del servidor

## Integración con herramientas de monitoreo

Este endpoint puede ser utilizado por:
- Load balancers
- Herramientas de monitoreo (Prometheus, Grafana, etc.)
- Sistemas de orquestación (Kubernetes, Docker Swarm)
- Herramientas de CI/CD para verificar despliegues

## Documentación Swagger

El endpoint está documentado en Swagger y puede ser accedido en:
```
http://localhost:3000/api-docs
``` 