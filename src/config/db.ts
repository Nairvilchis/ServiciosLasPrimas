import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

let isConnected: boolean = false;

export async function connectDB() {
  if (isConnected) {
    console.log('✅ MongoDB ya está conectado.');
    return;
  }

  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is not set.');
    // process.exit(1); // Removed to allow app to run without DB for dev purposes
    console.warn('⚠️ La aplicación continuará sin conexión a la base de datos. Las funciones dependientes de la base de datos no funcionarán.');
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error);
    // process.exit(1); // Removed to allow app to run without DB for dev purposes
    console.warn('⚠️ La aplicación continuará sin conexión a la base de datos. Las funciones dependientes de la base de datos no funcionarán.');
  }
}

// Optional: Function to check connection status
export function getDBConnectionStatus() {
  return { isConnected, MONGODB_URI_SET: !!MONGODB_URI };
}
