# 📋 WiiCare Backend - API Testing con Postman/Newman

## 📊 Estado de las Pruebas

| Categoría | Endpoints | Assertions | Estado | Última Ejecución |
|-----------|-----------|------------|--------|------------------|
| **Auth** | 3 | 7 | ✅ 100% | Automática |
| **Services** | 2 | 4 | ✅ 100% | Automática |
| **TOTAL** | **5** | **11** | **✅ 100%** | Newman CLI |

**Resumen de Ejecución:**
- ✅ 5 requests ejecutados
- ✅ 10 assertions pasadas
- ✅ 0 errores
- ⏱️ Tiempo promedio: ~148ms
- 📦 Datos recibidos: ~2.19kB

---

## 🎯 Cobertura de Pruebas API

### 1. 🔐 Autenticación (Auth)

#### **POST `/api/auth/register`** - Registro de Usuario
- **Descripción**: Crea un nuevo usuario en el sistema
- **Body de Ejemplo**:
```json
{
  "name": "Demo User",
  "email": "demo@example.com",
  "password": "Password123!",
  "role": "user"
}
```
- **Validaciones**:
  - ✅ Email único (no duplicados)
  - ✅ Contraseña cumple requisitos de seguridad
  - ✅ Role válido (`user`, `caregiver`, `admin`)
  - ✅ Retorna token JWT

---

#### **POST `/api/auth/login`** - Inicio de Sesión
- **Descripción**: Autentica usuario con credenciales
- **Body de Ejemplo**:
```json
{
  "email": "demo@example.com",
  "password": "Password123!"
}
```
- **Validaciones**:
  - ✅ Credenciales correctas
  - ✅ Retorna token JWT
  - ✅ Usuario existe en BD
  - ✅ Contraseña hasheada coincide

---

#### **GET `/api/auth/me`** - Información del Usuario Actual
- **Descripción**: Obtiene datos del usuario autenticado
- **Headers Requeridos**:
```
Authorization: Bearer {{token}}
```
- **Validaciones**:
  - ✅ Token válido y no expirado
  - ✅ Retorna datos del usuario (sin password)
  - ✅ Error 401 si token inválido

---

### 2. 🛠️ Servicios de Cuidado (Services)

#### **GET `/api/services`** - Obtener Todos los Servicios
- **Descripción**: Lista todos los servicios disponibles
- **Autenticación**: No requerida
- **Assertions**:
  - ✅ Status code 200
  - ✅ Response tiene array `services`
  - ✅ Array es válido

---

#### **GET `/api/services?query=cuidado`** - Buscar Servicios
- **Descripción**: Búsqueda de servicios por palabras clave
- **Query Parameters**:
  - `query` - Término de búsqueda (busca en title, description, tags)
  - `location` - Filtro por ubicación (opcional)
  - `maxRate` - Tarifa máxima (opcional)
- **Assertions**:
  - ✅ Status code 200
  - ✅ Response tiene array `services`
  - ✅ Búsqueda funciona correctamente

---

## 🚀 Cómo Ejecutar las Pruebas

### **Opción 1: Newman CLI (Headless)**
```powershell
# Instalar Newman (si no lo tienes)
npm install -g newman

# Ejecutar colección
cd Backend
newman run ../postman/WiiCare.postman_collection.json
```

### **Opción 2: Script PowerShell Visual** ⭐ (Recomendado para Presentaciones)
```powershell
cd Backend
.\run-postman-tests.ps1
```
**Características**:
- ✅ Output colorido y visual
- ✅ Verificación de prerrequisitos automática
- ✅ Indicador de progreso
- ✅ Manejo de errores con sugerencias
- ✅ Reporte JSON automático

### **Opción 3: Postman GUI (Interactivo)**
```
1. Abre Postman Desktop
2. Importa: postman/WiiCare.postman_collection.json
3. Configura variables de entorno:
   - baseUrl: http://44.211.88.225
   - token: (se genera automáticamente tras login)
4. Ejecuta la colección manualmente
```

---

## ⚙️ Configuración

### **Variables de Colección**
La colección usa estas variables que puedes configurar:

| Variable | Valor por Defecto | Descripción |
|----------|-------------------|-------------|
| `baseUrl` | `http://44.211.88.225` | URL base del backend |
| `token` | (vacío) | JWT token (se actualiza automáticamente) |

### **Variables de Entorno (Backend .env)**
```env
PORT=4000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/wiicare
JWT_SECRET=tu_secreto_super_seguro
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### **Prerequisitos**
- ✅ Backend corriendo (`npm run dev` en `Backend/`)
- ✅ MongoDB Atlas accesible
- ✅ Newman instalado (`npm install -g newman`)
- ✅ Variables de entorno configuradas (`.env`)

---

## 🐛 Troubleshooting

### ❌ **Error: "ECONNREFUSED 127.0.0.1:4000"**
**Solución**:
```powershell
# Inicia el backend
cd Backend
npm run dev
```

---

### ❌ **Error: "MongooseServerSelectionError"**
**Solución**:
- Verifica que `MONGODB_URI` en `.env` sea correcta
- Comprueba tu conexión a Internet
- Verifica IP whitelist en MongoDB Atlas

---

### ❌ **Error: "Token inválido" en endpoints protegidos**
**Solución**:
1. Ejecuta primero el endpoint `Auth → Login`
2. El token se guardará automáticamente en la variable `{{token}}`
3. Los demás endpoints lo usarán automáticamente

---

### ❌ **Newman no está instalado**
**Solución**:
```powershell
npm install -g newman
newman --version  # Verificar instalación
```

---

## 📈 Presentación Recomendada

### **Flujo de Demostración (5 minutos)**

#### **Minuto 1: Introducción**
```
"Vamos a probar la API de WiiCare usando Postman y Newman.
Nuestra colección cubre 3 áreas principales:
- Autenticación de usuarios
- Gestión de servicios de cuidado
- Sistema de mensajería"
```

#### **Minuto 2: Ejecutar Script Visual**
```powershell
cd Backend
.\run-postman-tests.ps1
```
- Muestra la verificación de dependencias
- Presiona ENTER para ejecutar
- Observa el output colorido de Newman

#### **Minuto 3: Explicar Resultados**
```
"Como pueden ver en el resumen de Newman:
✅ 5 requests ejecutados correctamente
✅ 10 assertions pasadas (validaciones automáticas)
✅ 0 errores
✅ Tiempo promedio de respuesta: ~148ms

La colección valida automáticamente:
- Códigos de estado HTTP correctos
- Estructura de las respuestas JSON
- Presencia de campos requeridos
- Guardado automático del token JWT
- El token se reutiliza en requests protegidos"
```

#### **Minuto 4: Demostración Manual en Postman GUI**
- Abre Postman
- Ejecuta `Auth → Register` (muestra body JSON)
- Ejecuta `Auth → Login` (muestra token generado)
- Ejecuta `Services → Search` (muestra resultados)

#### **Minuto 5: Cierre**
```
"Esto demuestra que nuestra API:
✅ Maneja autenticación JWT correctamente
✅ Valida datos de entrada con Zod
✅ Protege endpoints sensibles
✅ Retorna respuestas consistentes"
```

---

## 🎯 Beneficios de Postman/Newman

| Característica | Beneficio |
|----------------|-----------|
| **Colecciones versionables** | Control de versiones con Git |
| **Newman CLI** | Integrable en CI/CD pipelines |
| **Documentación automática** | Genera docs desde la colección |
| **Environments** | Diferentes configuraciones (dev, staging, prod) |
| **Pre/Post Scripts** | Automatización de tokens, validaciones |
| **Test Scripts** | Assertions avanzadas con JavaScript |
| **Mock Servers** | Testing sin backend real |

---

## 📚 Comandos Útiles

```powershell
# Ejecutar con variables de entorno custom
newman run coleccion.json --env-var "baseUrl=http://192.168.0.27:4000"

# Generar reporte HTML
newman run coleccion.json --reporters cli,html

# Ejecutar solo una carpeta específica
newman run coleccion.json --folder "Auth"

# Modo verbose (debugging)
newman run coleccion.json --verbose

# Exportar resultados JSON
newman run coleccion.json --reporters json --reporter-json-export results.json
```

---

## 🔗 Recursos Adicionales

- **Documentación Newman**: https://www.npmjs.com/package/newman
- **Postman Learning Center**: https://learning.postman.com/
- **Postman API**: https://www.postman.com/postman/workspace/postman-api/overview

---

## 📝 Notas para Desarrollo

### **Agregar Nuevos Endpoints a la Colección**
1. Abre Postman GUI
2. Agrega request a la carpeta correspondiente
3. Configura variables `{{baseUrl}}` y `{{token}}`
4. Exporta colección: `File → Export → Collection v2.1`
5. Reemplaza `postman/WiiCare.postman_collection.json`

### **Agregar Tests/Assertions**
En Postman, tab "Tests" de cada request:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has token", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.token).to.be.a('string');
});
```

---

**¿Preguntas? Consulta `Backend/README.md` o contacta al equipo de desarrollo.** 🚀
