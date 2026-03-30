const carSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    plate: { 
        type: String, 
        required: true, 
        unique: true 
    },
    model: { 
        type: String, 
        required: true 
    },
    color: { 
        type: String 
    },
    esPrincipal: { 
        type: Boolean, 
        default: false 
    }
}, { timestamps: true });

export default mongoose.model('Car', carSchema);