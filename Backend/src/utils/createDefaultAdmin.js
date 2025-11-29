const User = require('../models/User');
const { hashPassword } = require('./password');

async function createDefaultAdmin() {
  try {
    // Verificar si ya existe un admin
    const adminExists = await User.findOne({ email: 'admin@admin.com' });
    
    if (adminExists) {
      console.log('✓ Admin user already exists');
      return;
    }

    // Crear admin por defecto
    const passwordHash = await hashPassword('admin123');
    await User.create({
      name: 'admin',
      email: 'admin@admin.com',
      passwordHash,
      role: 'admin'
    });

    console.log('✓ Default admin created successfully');
    console.log('  Email: admin@admin.com');
    console.log('  Password: admin123');
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
}

module.exports = { createDefaultAdmin };
