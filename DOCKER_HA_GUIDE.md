# 🐳 WiiCare - Guía de Docker para Alta Disponibilidad

## Arquitectura

```
                    ┌─────────────────────────────────────────────────────┐
                    │                   CLIENTE                           │
                    └─────────────────────────────────────────────────────┘
                                          │
                                          ▼
                    ┌─────────────────────────────────────────────────────┐
                    │              NGINX LOAD BALANCER                     │
                    │                  (Puerto 80)                         │
                    │           Round-Robin + Health Checks                │
                    └─────────────────────────────────────────────────────┘
                                          │
              ┌───────────────────────────┼───────────────────────────┐
              │                           │                           │
              ▼                           ▼                           ▼
    ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
    │    API-1 🟢     │       │    API-2 🟢     │       │   API-3/4 ⏸️    │
    │    (Activo)     │       │    (Activo)     │       │   (Standby)     │
    │   PM2 Cluster   │       │   PM2 Cluster   │       │    Backup       │
    └─────────────────┘       └─────────────────┘       └─────────────────┘
              │                           │                           │
              └───────────────────────────┼───────────────────────────┘
                                          │
                                          ▼
    ┌─────────────────────────────────────────────────────────────────────┐
    │                     MONGODB REPLICA SET (rs0)                        │
    │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐            │
    │  │   MONGO-1     │  │   MONGO-2     │  │   MONGO-3     │            │
    │  │   PRIMARY     │  │  SECONDARY    │  │  SECONDARY    │            │
    │  │ (Prioridad 3) │  │ (Prioridad 2) │  │ (Prioridad 1) │            │
    │  └───────────────┘  └───────────────┘  └───────────────┘            │
    └─────────────────────────────────────────────────────────────────────┘
```

## 📂 Estructura de Archivos

```
WiiCare/
├── docker-compose.yml          # Orquestación de contenedores
├── .env.docker                 # Variables de entorno
├── Backend/
│   └── Dockerfile              # Imagen de la API
├── nginx/
│   └── nginx.conf              # Configuración del load balancer
└── mongo/
    └── mongo-init.js           # Inicialización de MongoDB
```

## 🚀 Inicio Rápido

### 1. Preparar el entorno

```powershell
# Clonar/navegar al proyecto
cd C:\Users\lenovo\OneDrive\Desktop\Proyectos\WiiCare

# Copiar y configurar variables de entorno
cp .env.docker .env
# Editar .env con tus contraseñas seguras
```

### 2. Construir e iniciar los contenedores

```powershell
# Construir imágenes
docker-compose build

# Iniciar servicios (primera vez - puede tardar)
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f
```

### 3. Verificar el estado

```powershell
# Ver estado de todos los contenedores
docker-compose ps

# Health check
curl http://localhost/cluster-status
curl http://localhost/health
```

## ⚙️ Gestión de Contenedores

### Comandos básicos

```powershell
# Iniciar todos los servicios
docker-compose up -d

# Detener todos los servicios
docker-compose down

# Reiniciar un servicio específico
docker-compose restart api-1

# Ver logs de un servicio
docker-compose logs -f api-1

# Escalar APIs activas (ej: 3 instancias)
docker-compose up -d --scale api-1=1 --scale api-2=1
```

### Activar contenedores de standby

```powershell
# Activar API en standby (cuando una activa falla)
docker-compose up -d api-standby-1

# O activar ambas de standby
docker-compose up -d api-standby-1 api-standby-2
```

### Simular failover

```powershell
# Detener una API activa para probar failover
docker-compose stop api-1

# Verificar que el tráfico se redirige a api-2
curl http://localhost/health

# Activar standby como reemplazo
docker-compose up -d api-standby-1

# Restaurar api-1
docker-compose up -d api-1
```

## 🔍 Monitoreo

### Ver estado de MongoDB Replica Set

```powershell
# Conectar a MongoDB
docker exec -it mongo1 mongosh --eval "rs.status()"

# Ver quién es el primary
docker exec -it mongo1 mongosh --eval "rs.isMaster()"
```

### Ver métricas de Nginx

```powershell
# Estado del load balancer
curl http://localhost/nginx-health

# Logs de acceso
docker-compose logs nginx
```

### Health Checks

```powershell
# Estado general del cluster
curl http://localhost/cluster-status

# Health de cada API
docker exec wiicare-api-1 wget -q -O- http://localhost:3000/health
docker exec wiicare-api-2 wget -q -O- http://localhost:3000/health
```

## 🛡️ Alta Disponibilidad

### Características implementadas:

| Componente | HA Feature |
|------------|------------|
| **Nginx** | Failover automático a APIs de backup |
| **API** | 2 activas + 2 standby, PM2 cluster mode |
| **MongoDB** | Replica Set con 3 nodos, failover automático |

### Comportamiento de failover:

1. **API falla**: Nginx detecta el fallo (health check) y redirige a otra API activa
2. **Todas las APIs activas fallan**: Nginx usa las APIs de standby (backup)
3. **MongoDB Primary falla**: Replica Set elige nuevo Primary automáticamente

## 📊 Pruebas de Carga

```powershell
# Instalar hey (herramienta de benchmark)
# Windows: choco install hey
# O descargar de: https://github.com/rakyll/hey

# Prueba básica de carga
hey -n 1000 -c 50 http://localhost/health

# Prueba de stress
hey -n 10000 -c 100 http://localhost/api/users
```

## 🔧 Troubleshooting

### MongoDB no inicia el Replica Set

```powershell
# Verificar logs
docker-compose logs mongo1

# Inicializar manualmente
docker exec -it mongo1 mongosh --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'mongo1:27017'},{_id:1,host:'mongo2:27017'},{_id:2,host:'mongo3:27017'}]})"
```

### API no conecta a MongoDB

```powershell
# Verificar que MongoDB está corriendo
docker-compose ps mongo1 mongo2 mongo3

# Verificar red
docker network inspect wiicare-network

# Ver logs de la API
docker-compose logs api-1
```

### Nginx no responde

```powershell
# Verificar configuración
docker exec nginx nginx -t

# Recargar configuración
docker exec nginx nginx -s reload

# Ver logs de error
docker-compose logs nginx
```

## 🔐 Seguridad en Producción

1. **Cambiar contraseñas** en `.env`:
   - `MONGO_INITDB_ROOT_PASSWORD`
   - `JWT_SECRET`
   - Contraseñas en `MONGODB_URI`

2. **Habilitar SSL/TLS**:
   - Descomentar la sección HTTPS en `nginx.conf`
   - Agregar certificados en `nginx/ssl/`

3. **Restringir acceso**:
   - Configurar firewall
   - Usar VPN para acceso administrativo

## 📝 Logs y Volúmenes

```powershell
# Ver volúmenes de datos
docker volume ls | grep wiicare

# Backup de MongoDB
docker exec mongo1 mongodump --archive=/backup/wiicare.archive --db=wiicare
docker cp mongo1:/backup/wiicare.archive ./backups/

# Restaurar backup
docker cp ./backups/wiicare.archive mongo1:/backup/
docker exec mongo1 mongorestore --archive=/backup/wiicare.archive
```

## 🛑 Limpieza Completa

```powershell
# Detener y eliminar contenedores
docker-compose down

# Eliminar también volúmenes (⚠️ BORRA DATOS)
docker-compose down -v

# Eliminar imágenes
docker-compose down --rmi all

# Limpiar todo
docker system prune -a --volumes
```
