const { Schema, model } = require('mongoose');

/**
 * Modelo para almacenar lecturas de fuerza del sensor FSR
 * Conectado al Arduino vía puerto serial
 */
const ForceReadingSchema = new Schema(
  {
    // Usuario al que pertenece esta lectura
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true 
    },
    // Valor ADC crudo del sensor (0-1023)
    adcValue: { 
      type: Number, 
      required: true,
      min: 0,
      max: 1023
    },
    // Fuerza calculada en Newtons
    forceNewtons: { 
      type: Number, 
      required: true,
      min: 0
    },
    // Timestamp de la lectura del sensor
    readingTimestamp: { 
      type: Date, 
      default: Date.now 
    },
    // Notas opcionales del usuario o cuidador
    notes: { 
      type: String, 
      default: '' 
    },
    // Sesión de medición (para agrupar lecturas)
    sessionId: { 
      type: String,
      index: true
    }
  },
  { timestamps: true }
);

// Índice compuesto para consultas eficientes por usuario y fecha
ForceReadingSchema.index({ userId: 1, readingTimestamp: -1 });

// Método estático para obtener estadísticas de un usuario
ForceReadingSchema.statics.getStats = async function(userId, startDate, endDate) {
  const match = { userId };
  if (startDate || endDate) {
    match.readingTimestamp = {};
    if (startDate) match.readingTimestamp.$gte = startDate;
    if (endDate) match.readingTimestamp.$lte = endDate;
  }

  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        avgForce: { $avg: '$forceNewtons' },
        maxForce: { $max: '$forceNewtons' },
        minForce: { $min: '$forceNewtons' },
        totalReadings: { $sum: 1 }
      }
    }
  ]);

  return stats[0] || { avgForce: 0, maxForce: 0, minForce: 0, totalReadings: 0 };
};

module.exports = model('ForceReading', ForceReadingSchema);
