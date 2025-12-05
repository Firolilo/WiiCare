# Dockerfile para WiiCare Backend API
# Imagen base Node.js LTS
FROM node:20-alpine

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && npm install -g pm2

# Crear directorio de la aplicación
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production

# Copiar código fuente
COPY src/ ./src/
COPY scripts/ ./scripts/

# Crear directorio para logs
RUN mkdir -p logs

# Exponer puerto de la API
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Comando para iniciar con PM2
CMD ["pm2-runtime", "start", "src/index.js", "--name", "wiicare-api", "-i", "2"]
