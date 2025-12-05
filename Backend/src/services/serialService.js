const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const ForceReading = require('../models/ForceReading');

/**
 * Servicio de comunicación serial con Arduino
 * Lee datos del sensor FSR y los procesa
 */
class SerialService {
  constructor() {
    this.port = null;
    this.parser = null;
    this.io = null;
    this.currentUserId = null;
    this.currentSessionId = null;
    this.isConnected = false;
    this.lastReading = null;
  }

  /**
   * Inicializa el servicio con Socket.IO para emisión en tiempo real
   */
  setSocketIO(io) {
    this.io = io;
  }

  /**
   * Lista los puertos seriales disponibles
   */
  async listPorts() {
    try {
      const ports = await SerialPort.list();
      return ports.map(port => ({
        path: port.path,
        manufacturer: port.manufacturer || 'Desconocido',
        vendorId: port.vendorId,
        productId: port.productId
      }));
    } catch (error) {
      console.error('Error listando puertos:', error);
      return [];
    }
  }

  /**
   * Conecta al puerto serial del Arduino
   * @param {string} portPath - Ruta del puerto (ej: COM3, /dev/ttyUSB0)
   * @param {number} baudRate - Velocidad de baudios (default: 9600)
   */
  async connect(portPath, baudRate = 9600) {
    if (this.isConnected) {
      await this.disconnect();
    }

    return new Promise((resolve, reject) => {
      try {
        this.port = new SerialPort({
          path: portPath,
          baudRate: baudRate,
          autoOpen: false
        });

        this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\n' }));

        this.port.open((err) => {
          if (err) {
            console.error('Error abriendo puerto serial:', err);
            reject(err);
            return;
          }

          this.isConnected = true;
          console.log(`✅ Puerto serial conectado: ${portPath} @ ${baudRate} baudios`);

          // Configurar listener de datos
          this.parser.on('data', (data) => this.handleData(data));

          // Manejar errores
          this.port.on('error', (error) => {
            console.error('Error en puerto serial:', error);
            this.isConnected = false;
            if (this.io) {
              this.io.emit('serial-error', { error: error.message });
            }
          });

          // Manejar cierre
          this.port.on('close', () => {
            console.log('Puerto serial cerrado');
            this.isConnected = false;
            if (this.io) {
              this.io.emit('serial-disconnected');
            }
          });

          resolve({ success: true, port: portPath, baudRate });
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Desconecta del puerto serial
   */
  async disconnect() {
    return new Promise((resolve) => {
      if (this.port && this.port.isOpen) {
        this.port.close((err) => {
          if (err) {
            console.error('Error cerrando puerto:', err);
          }
          this.isConnected = false;
          this.port = null;
          this.parser = null;
          resolve({ success: true });
        });
      } else {
        this.isConnected = false;
        resolve({ success: true });
      }
    });
  }

  /**
   * Procesa los datos recibidos del Arduino
   * Formato esperado: "ADC: XXX  |  Fuerza (N): YYY"
   */
  handleData(rawData) {
    try {
      const data = rawData.trim();
      console.log('📡 Dato serial recibido:', data);

      // Parsear el formato del Arduino
      const adcMatch = data.match(/ADC:\s*([\d.]+)/);
      const forceMatch = data.match(/Fuerza \(N\):\s*([\d.]+)/);

      if (adcMatch && forceMatch) {
        const reading = {
          adcValue: parseFloat(adcMatch[1]),
          forceNewtons: parseFloat(forceMatch[1]),
          timestamp: new Date()
        };

        this.lastReading = reading;

        // Emitir en tiempo real vía Socket.IO
        if (this.io) {
          this.io.emit('force-reading', reading);
        }

        // Si hay una sesión activa, guardar en base de datos
        if (this.currentUserId && this.currentSessionId) {
          this.saveReading(reading);
        }

        console.log(`💪 Lectura: ADC=${reading.adcValue}, Fuerza=${reading.forceNewtons}N`);
      }
    } catch (error) {
      console.error('Error procesando datos:', error);
    }
  }

  /**
   * Guarda una lectura en la base de datos
   */
  async saveReading(reading) {
    try {
      const forceReading = new ForceReading({
        userId: this.currentUserId,
        adcValue: reading.adcValue,
        forceNewtons: reading.forceNewtons,
        readingTimestamp: reading.timestamp,
        sessionId: this.currentSessionId
      });

      await forceReading.save();
      
      // Notificar que la lectura fue guardada
      if (this.io) {
        this.io.emit('force-reading-saved', { 
          id: forceReading._id,
          ...reading 
        });
      }
    } catch (error) {
      console.error('Error guardando lectura:', error);
    }
  }

  /**
   * Inicia una sesión de medición para un usuario
   */
  startSession(userId) {
    this.currentUserId = userId;
    this.currentSessionId = `session_${Date.now()}_${userId}`;
    console.log(`📋 Sesión iniciada: ${this.currentSessionId} para usuario ${userId}`);
    return {
      sessionId: this.currentSessionId,
      userId: this.currentUserId,
      startedAt: new Date()
    };
  }

  /**
   * Finaliza la sesión de medición actual
   */
  stopSession() {
    const session = {
      sessionId: this.currentSessionId,
      userId: this.currentUserId,
      stoppedAt: new Date()
    };
    this.currentUserId = null;
    this.currentSessionId = null;
    console.log('📋 Sesión finalizada');
    return session;
  }

  /**
   * Obtiene el estado actual del servicio
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      port: this.port?.path || null,
      hasActiveSession: !!this.currentSessionId,
      sessionId: this.currentSessionId,
      userId: this.currentUserId,
      lastReading: this.lastReading
    };
  }
}

// Singleton para uso global
const serialService = new SerialService();

module.exports = serialService;
