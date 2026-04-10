import mongoose from 'mongoose';

const sensorSchema = new mongoose.Schema({
    model: {
        type: String,
        required: true
    },
    pin_trigger: {
        type: Number,
        required: true
    },
    pin_echo: {
        type: Number,
        required: true
    },
    distance: {
        type: Number,
        required: true
    },
    lastDistance: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

export default mongoose.model('Sensor', sensorSchema);