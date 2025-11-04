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

  await Service.create({
    caregiver: caregiver._id,
    title: 'Cuidado especializado TEA',
    description: 'Experiencia con TEA y TDAH',
    rate: 15,
    tags: ['TEA', 'Infantil'],
    location: 'Madrid',
  });

  console.log('Seed completado:', { caregiver: caregiver.email, user: user.email });
  await mongoose.connection.close();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
