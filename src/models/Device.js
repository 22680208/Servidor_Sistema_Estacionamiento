const deviceSchema = new mongoose.Schema({
    deviceId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    name: { 
        type: String, 
        default: "Entrada Principal" 
    },
    status: { 
        type: String, 
        enum: ['online', 'offline'], 
        default: 'offline' 
    },
    lastSeen: { 
        type: Date, 
        default: Date.now 
    },
    config: {
        umbralDistance: { type: Number, default: 15 },
        intervalHeartbeat: { type: Number, default: 60000 }
    }
}, { timestamps: true });

export default mongoose.model('Device', deviceSchema);