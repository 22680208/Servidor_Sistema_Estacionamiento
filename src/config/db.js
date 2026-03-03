import mongoose from 'mongoose';
import { setServers } from "node:dns/promises";
setServers(["1.1.1.1", "8.8.8.8"]);

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        await mongoose.connection.db.admin().command({ ping: 1 });
        console.log("Conectado a MongoDB");
        
    } catch (error) {
        console.error("Error crítico en la conexión a la DB:");
        console.error(error.message);
        
    }
};

mongoose.connection.on('error', err => {
    console.log(`Error de MongoDB en tiempo de ejecución: ${err}`);
});

mongoose.connection.on('disconnected', () => {
    console.log('Se ha perdido la conexión con la base de datos');
});