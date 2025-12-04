const CareTemplate = require('../src/models/CareTemplate');

const defaultTemplates = [
  {
    name: 'Cuidado para Adulto Mayor',
    patientType: 'elderly',
    description: 'Plantilla estándar para el cuidado de personas mayores con necesidades básicas de asistencia',
    isSystemTemplate: true,
    tasks: [
      { name: 'Asistencia matutina', description: 'Ayuda para levantarse, higiene personal', frequency: 'daily', category: 'hygiene' },
      { name: 'Desayuno', description: 'Preparar y supervisar alimentación', frequency: 'daily', category: 'nutrition' },
      { name: 'Medicación matutina', description: 'Administrar medicamentos prescritos', frequency: 'daily', category: 'medication' },
      { name: 'Movilidad y ejercicios', description: 'Ejercicios suaves, caminata corta', frequency: 'daily', category: 'exercise' },
      { name: 'Control de presión arterial', description: 'Medir y registrar presión', frequency: 'daily', category: 'monitoring' },
      { name: 'Hidratación', description: 'Asegurar ingesta adecuada de líquidos', frequency: 'daily', category: 'nutrition' },
      { name: 'Almuerzo', description: 'Preparar y supervisar alimentación', frequency: 'daily', category: 'nutrition' },
      { name: 'Tiempo de descanso', description: 'Siesta o reposo', frequency: 'daily', category: 'other' },
      { name: 'Actividades recreativas', description: 'Lectura, juegos, socialización', frequency: 'daily', category: 'other' },
      { name: 'Cena', description: 'Preparar y supervisar alimentación', frequency: 'daily', category: 'nutrition' },
      { name: 'Medicación nocturna', description: 'Administrar medicamentos de la noche', frequency: 'daily', category: 'medication' },
      { name: 'Higiene nocturna', description: 'Preparación para dormir', frequency: 'daily', category: 'hygiene' }
    ],
    recommendations: [
      'Mantener rutina consistente para promover estabilidad',
      'Fomentar independencia en la medida de lo posible',
      'Vigilar cambios en el estado de ánimo o comportamiento',
      'Asegurar ambiente seguro sin riesgos de caídas',
      'Promover interacción social y actividades cognitivas'
    ],
    healthIndicators: [
      { name: 'Presión arterial', unit: 'mmHg', normalRange: '120/80' },
      { name: 'Frecuencia cardíaca', unit: 'bpm', normalRange: '60-100' },
      { name: 'Temperatura', unit: '°C', normalRange: '36.5-37.5' },
      { name: 'Estado de ánimo', unit: 'escala 1-10', normalRange: '7-10' },
      { name: 'Calidad del sueño', unit: 'horas', normalRange: '7-9' }
    ]
  },
  {
    name: 'Cuidado Infantil',
    patientType: 'child',
    description: 'Plantilla para el cuidado integral de niños',
    isSystemTemplate: true,
    tasks: [
      { name: 'Despertar y rutina matutina', description: 'Levantar, aseo personal', frequency: 'daily', category: 'hygiene' },
      { name: 'Desayuno nutritivo', description: 'Preparar y supervisar desayuno', frequency: 'daily', category: 'nutrition' },
      { name: 'Preparación para escuela', description: 'Vestir, materiales escolares', frequency: 'daily', category: 'other' },
      { name: 'Tiempo de juego', description: 'Actividades recreativas supervisadas', frequency: 'daily', category: 'exercise' },
      { name: 'Almuerzo', description: 'Comida balanceada', frequency: 'daily', category: 'nutrition' },
      { name: 'Hora de siesta', description: 'Descanso apropiado para la edad', frequency: 'daily', category: 'other' },
      { name: 'Tarea escolar', description: 'Apoyo con deberes', frequency: 'daily', category: 'other' },
      { name: 'Actividad física', description: 'Juegos, deportes, parque', frequency: 'daily', category: 'exercise' },
      { name: 'Merienda saludable', description: 'Snack nutritivo', frequency: 'daily', category: 'nutrition' },
      { name: 'Cena', description: 'Cena balanceada', frequency: 'daily', category: 'nutrition' },
      { name: 'Baño', description: 'Higiene personal nocturna', frequency: 'daily', category: 'hygiene' },
      { name: 'Rutina de dormir', description: 'Cuento, relajación, sueño', frequency: 'daily', category: 'other' }
    ],
    recommendations: [
      'Establecer rutinas consistentes para seguridad emocional',
      'Fomentar desarrollo físico y cognitivo apropiado para la edad',
      'Supervisión constante durante actividades',
      'Promover hábitos saludables de alimentación',
      'Estimular creatividad y aprendizaje a través del juego',
      'Vigilar calendario de vacunación'
    ],
    healthIndicators: [
      { name: 'Temperatura', unit: '°C', normalRange: '36.5-37.5' },
      { name: 'Estado de ánimo', unit: 'escala', normalRange: 'alegre/activo' },
      { name: 'Apetito', unit: 'calidad', normalRange: 'bueno' },
      { name: 'Sueño', unit: 'horas', normalRange: '9-12' },
      { name: 'Desarrollo', unit: 'observación', normalRange: 'apropiado para edad' }
    ]
  },
  {
    name: 'Cuidado para Personas con Discapacidad',
    patientType: 'disability',
    description: 'Plantilla de cuidado especializado con enfoque en autonomía',
    isSystemTemplate: true,
    tasks: [
      { name: 'Asistencia matutina personalizada', description: 'Apoyo según necesidades específicas', frequency: 'daily', category: 'hygiene' },
      { name: 'Terapia física', description: 'Ejercicios de movilidad y fortalecimiento', frequency: 'daily', category: 'therapy' },
      { name: 'Apoyo en alimentación', description: 'Adaptada a necesidades', frequency: 'daily', category: 'nutrition' },
      { name: 'Medicación', description: 'Administración según prescripción', frequency: 'daily', category: 'medication' },
      { name: 'Terapia ocupacional', description: 'Actividades de vida diaria', frequency: 'daily', category: 'therapy' },
      { name: 'Ejercicios de autonomía', description: 'Fomentar independencia', frequency: 'daily', category: 'exercise' },
      { name: 'Estimulación cognitiva', description: 'Actividades adaptadas', frequency: 'daily', category: 'therapy' },
      { name: 'Control de salud', description: 'Monitoreo según condición', frequency: 'daily', category: 'monitoring' }
    ],
    recommendations: [
      'Adaptar el entorno para maximizar autonomía',
      'Respetar ritmos y capacidades individuales',
      'Fomentar comunicación y expresión',
      'Coordinar con terapeutas especializados',
      'Celebrar logros y avances',
      'Mantener rutinas predecibles'
    ],
    healthIndicators: [
      { name: 'Nivel de autonomía', unit: 'escala', normalRange: 'observar mejoras' },
      { name: 'Estado físico', unit: 'observación', normalRange: 'estable' },
      { name: 'Comunicación', unit: 'calidad', normalRange: 'efectiva' },
      { name: 'Estado emocional', unit: 'escala 1-10', normalRange: '7-10' },
      { name: 'Participación en actividades', unit: 'nivel', normalRange: 'activo' }
    ]
  },
  {
    name: 'Cuidado Post-Operatorio',
    patientType: 'post-surgery',
    description: 'Cuidado especializado para recuperación post-quirúrgica',
    isSystemTemplate: true,
    tasks: [
      { name: 'Control de signos vitales', description: 'Temperatura, presión, pulso', frequency: 'daily', category: 'monitoring' },
      { name: 'Limpieza de herida', description: 'Curación según indicaciones médicas', frequency: 'daily', category: 'hygiene' },
      { name: 'Medicación analgésica', description: 'Control del dolor', frequency: 'daily', category: 'medication' },
      { name: 'Antibióticos', description: 'Según prescripción', frequency: 'daily', category: 'medication' },
      { name: 'Movilización gradual', description: 'Según indicaciones médicas', frequency: 'daily', category: 'exercise' },
      { name: 'Alimentación adecuada', description: 'Dieta según recuperación', frequency: 'daily', category: 'nutrition' },
      { name: 'Hidratación', description: 'Ingesta de líquidos', frequency: 'daily', category: 'nutrition' },
      { name: 'Vigilancia de complicaciones', description: 'Signos de infección, sangrado', frequency: 'daily', category: 'monitoring' },
      { name: 'Fisioterapia', description: 'Si está prescrita', frequency: 'daily', category: 'therapy' },
      { name: 'Reposo', description: 'Descanso adecuado', frequency: 'daily', category: 'other' }
    ],
    recommendations: [
      'Seguir estrictamente las indicaciones médicas',
      'Vigilar signos de infección (fiebre, enrojecimiento, dolor excesivo)',
      'Evitar esfuerzos físicos no autorizados',
      'Mantener higiene de la herida',
      'Contactar al médico ante cualquier anomalía',
      'Respetar restricciones de movimiento'
    ],
    healthIndicators: [
      { name: 'Temperatura', unit: '°C', normalRange: '36.5-37.5' },
      { name: 'Presión arterial', unit: 'mmHg', normalRange: '120/80' },
      { name: 'Estado de herida', unit: 'observación', normalRange: 'sin signos de infección' },
      { name: 'Nivel de dolor', unit: 'escala 0-10', normalRange: '0-3' },
      { name: 'Movilidad', unit: 'observación', normalRange: 'mejorando gradualmente' }
    ]
  },
  {
    name: 'Cuidado Temporal/Emergencia',
    patientType: 'temporary',
    description: 'Cuidado básico para situaciones temporales o de emergencia',
    isSystemTemplate: true,
    tasks: [
      { name: 'Evaluación inicial', description: 'Estado general, necesidades inmediatas', frequency: 'once', category: 'monitoring' },
      { name: 'Asistencia básica', description: 'Higiene, alimentación', frequency: 'daily', category: 'hygiene' },
      { name: 'Medicación si necesaria', description: 'Según indicaciones', frequency: 'daily', category: 'medication' },
      { name: 'Monitoreo de estado', description: 'Vigilancia general', frequency: 'daily', category: 'monitoring' },
      { name: 'Comunicación con familia', description: 'Actualizaciones regulares', frequency: 'daily', category: 'other' },
      { name: 'Notas de seguimiento', description: 'Registro de eventos importantes', frequency: 'daily', category: 'other' }
    ],
    recommendations: [
      'Mantener comunicación constante con la familia',
      'Documentar todas las actividades y cambios',
      'Estar preparado para situaciones imprevistas',
      'Coordinar transición a cuidado permanente si es necesario',
      'Establecer confianza rápidamente'
    ],
    healthIndicators: [
      { name: 'Estado general', unit: 'observación', normalRange: 'estable' },
      { name: 'Estado emocional', unit: 'escala 1-10', normalRange: '5-10' },
      { name: 'Necesidades cubiertas', unit: 'checklist', normalRange: 'todas' }
    ]
  }
];

async function seedCareTemplates() {
  try {
    // Eliminar plantillas del sistema existentes
    await CareTemplate.deleteMany({ isSystemTemplate: true });
    
    // Insertar nuevas plantillas
    await CareTemplate.insertMany(defaultTemplates);
    
    console.log('✅ Plantillas de cuidado creadas exitosamente');
    console.log(`   ${defaultTemplates.length} plantillas del sistema agregadas`);
  } catch (error) {
    console.error('❌ Error al crear plantillas:', error);
    throw error;
  }
}

module.exports = { seedCareTemplates, defaultTemplates };

// Si se ejecuta directamente
if (require.main === module) {
  const mongoose = require('mongoose');
  require('dotenv').config();
  
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wiicare')
    .then(async () => {
      console.log('📦 Conectado a MongoDB');
      await seedCareTemplates();
      await mongoose.disconnect();
      console.log('✅ Proceso completado');
      process.exit(0);
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}
