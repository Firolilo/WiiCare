// mongo-init.js
// Script de inicialización para MongoDB Replica Set

// Esperar a que MongoDB esté listo
function waitForMongo() {
  let ready = false;
  while (!ready) {
    try {
      db.runCommand({ ping: 1 });
      ready = true;
    } catch (e) {
      sleep(1000);
    }
  }
}

waitForMongo();

// Inicializar Replica Set
try {
  rs.status();
  print("Replica Set ya inicializado");
} catch (e) {
  print("Inicializando Replica Set...");
  
  rs.initiate({
    _id: "rs0",
    members: [
      { _id: 0, host: "mongo1:27017", priority: 3 },  // Primary preferido
      { _id: 1, host: "mongo2:27017", priority: 2 },  // Secondary
      { _id: 2, host: "mongo3:27017", priority: 1 }   // Secondary
    ]
  });

  // Esperar a que el replica set esté listo
  sleep(5000);

  // Verificar estado
  print("Estado del Replica Set:");
  printjson(rs.status());
}

// Crear usuario administrador
try {
  db = db.getSiblingDB("admin");
  
  // Verificar si ya existe el usuario
  const users = db.getUsers();
  const adminExists = users.users.some(u => u.user === "wiicare_admin");
  
  if (!adminExists) {
    db.createUser({
      user: "wiicare_admin",
      pwd: "wiicare_secure_password_2024",
      roles: [
        { role: "root", db: "admin" }
      ]
    });
    print("Usuario administrador creado");
  } else {
    print("Usuario administrador ya existe");
  }
} catch (e) {
  print("Error creando usuario admin: " + e);
}

// Crear base de datos y usuario de aplicación
try {
  db = db.getSiblingDB("wiicare");
  
  // Crear usuario de aplicación
  db.createUser({
    user: "wiicare_app",
    pwd: "wiicare_app_password_2024",
    roles: [
      { role: "readWrite", db: "wiicare" }
    ]
  });
  print("Usuario de aplicación creado");
  
  // Crear índices iniciales para mejor rendimiento
  db.createCollection("users");
  db.users.createIndex({ email: 1 }, { unique: true });
  db.users.createIndex({ role: 1 });
  
  db.createCollection("caregivers");
  db.caregivers.createIndex({ userId: 1 });
  db.caregivers.createIndex({ isAvailable: 1 });
  
  db.createCollection("patients");
  db.patients.createIndex({ userId: 1 });
  
  db.createCollection("appointments");
  db.appointments.createIndex({ patientId: 1, date: 1 });
  db.appointments.createIndex({ caregiverId: 1, date: 1 });
  
  db.createCollection("messages");
  db.messages.createIndex({ conversationId: 1, createdAt: -1 });
  db.messages.createIndex({ senderId: 1 });
  
  db.createCollection("forcereadings");
  db.forcereadings.createIndex({ patientId: 1, timestamp: -1 });
  db.forcereadings.createIndex({ sessionId: 1 });
  
  db.createCollection("reviews");
  db.reviews.createIndex({ caregiverId: 1 });
  db.reviews.createIndex({ patientId: 1 });
  
  print("Colecciones e índices creados exitosamente");
  
} catch (e) {
  print("Nota: " + e.message);
}

print("=================================");
print("Inicialización de MongoDB completada");
print("=================================");
