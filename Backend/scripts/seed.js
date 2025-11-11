require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../src/config/db');
const User = require('../src/models/User');
const Service = require('../src/models/Service');
const { hashPassword } = require('../src/utils/password');

async function seed() {
  await connectDB(process.env.MONGODB_URI);
  await mongoose.connection.db.dropDatabase();

  const caregiver = await User.create({
    name: 'Cuidador Demo',
    email: 'caregiver@demo.com',
    passwordHash: await hashPassword('Password123!'),
    role: 'caregiver',
    location: 'Madrid',
  });
  const user = await User.create({
    name: 'Usuario Demo',
    email: 'user@demo.com',
    passwordHash: await hashPassword('Password123!'),
    role: 'user',
    location: 'Madrid',
  });

  // Usuario de prueba simple para testing
  const testUser = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    passwordHash: await hashPassword('password123'),
    role: 'user',
    location: 'San José',
  });

  const testCaregiver = await User.create({
    name: 'Test Caregiver',
    email: 'test@caregiver.com',
    passwordHash: await hashPassword('password123'),
    role: 'caregiver',
    location: 'San José',
  });

  await Service.create({
    caregiver: caregiver._id,
    title: 'Cuidado especializado TEA',
    description: 'Experiencia con TEA y TDAH',
    rate: 15,
    tags: ['TEA', 'Infantil'],
    location: 'Madrid',
  });

  await Service.create({
    caregiver: testCaregiver._id,
    title: 'Cuidado de adultos mayores',
    description: 'Cuidado especializado para personas de la tercera edad',
    rate: 12,
    tags: ['Adultos', 'Enfermería'],
    location: 'San José',
  });

  console.log('✅ Seed completado:');
  console.log('  - Cuidador Demo:', caregiver.email, '/ Password123!');
  console.log('  - Usuario Demo:', user.email, '/ Password123!');
  console.log('  - Test User:', testUser.email, '/ password123');
  console.log('  - Test Caregiver:', testCaregiver.email, '/ password123');
  await mongoose.connection.close();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
