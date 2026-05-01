import Place from '../models/Place.js';
import Sensor from '../models/Sensor.js';

export const createPlace = async (req, res) => {
    const [{place},{sensor}] = req.body;
    try {
        const {model, pin_trigger, pin_echo, distance, lastDistance} = sensor;
        const {number, state, type} = place;
        const values = [model, pin_trigger, pin_echo, distance, lastDistance, number, state, type];
        const allValid = values.every(v => v !== undefined && v !== null && v !== "");

        if (!allValid) {
            return res.status(400).json({ message: 'Todos los campos son requeridos' });
        }
        const sensorC = await Sensor.create({ model, pin_trigger, pin_echo, distance, lastDistance });
        await sensorC.save();
        const placeC = await Place.create({ sensorId: sensorC.id, number, state, type });
        await placeC.save();
        return res.status(201).json({ message: 'Lugar creado correctamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al crear el lugar' });
    }
}

export const getPlaces = async (req, res) => {
    try {
        const places = await Place.find().lean();
        const placesData = places.map(place => {
            return {
                id: place._id,
                number: place.number,
                sensorId: place.sensorId,
                state: place.state,
                type: place.type,
            }
        });
        return res.status(200).json({ data: placesData, message: 'Lugares obtenidos correctamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener los lugares' });
    }
}

export const getPlace = async (req, res) => {
    const { id } = req.params;
    try {
        const place = await Place.findById(id).lean();
        if (!place) {
            return res.status(404).json({ message: 'Lugar no encontrado' });
        }
        const sensor = await Sensor.findById(place.sensorId).lean();
        if (!sensor) {
            return res.status(404).json({ message: 'Sensor no encontrado' });
        }
        const placeAndSensor = {
            id: place._id,
            number: place.number,
            state: place.state,
            type: place.type,
            sensorId: place.sensorId,
            model: sensor.model,
            pin_trigger: sensor.pin_trigger,
            pin_echo: sensor.pin_echo,
            distance: sensor.distance,
            lastDistance: sensor.lastDistance
        }
        return res.status(200).json({ data: placeAndSensor, message: 'Lugar obtenido correctamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener el lugar' });
    }
}

export const updatePlace = async (req, res) => {
    const { id } = req.params;
    const { number, state, type } = req.body;
    try {
        const place = await Place.findById(id);
        if (!place) {
            return res.status(404).json({ data: null, message: 'Lugar no encontrado' });
        }
        place.number = number;
        place.state = state;
        place.type = type;
        await place.save();
        return res.status(200).json({ message: 'Lugar actualizado correctamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al actualizar el lugar' });
    }
}

export const updateSensor = async (req, res) => {
    const { id } = req.params;
    const { model, pin_trigger, pin_echo, distance, lastDistance } = req.body;
    try {
        const values = [model, pin_trigger, pin_echo, distance, lastDistance];
        const allValid = values.every(v => v !== undefined && v !== null && v !== "");
        if (!allValid) {
            return res.status(400).json({ message: 'Todos los campos son requeridos' });
        }
        const sensor = await Sensor.findById(id);
        if (!sensor) {
            return res.status(404).json({ message: 'Sensor no encontrado' });
        }
        sensor.model = model;
        sensor.pin_trigger = pin_trigger;
        sensor.pin_echo = pin_echo;
        sensor.distance = distance;
        sensor.lastDistance = lastDistance;
        await sensor.save();
        return res.status(200).json({ message: 'Sensor actualizado correctamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al actualizar el sensor' });
    }
}

export const deletePlace = async (req, res) => {
    const { id } = req.params;
    try {
        const place = await Place.findByIdAndDelete(id);
        if (!place) {
            return res.status(404).json({ message: 'Lugar no encontrado' });
        }
        const sensor = await Sensor.findByIdAndDelete(place.sensorId);
        if (!sensor) {
            return res.status(404).json({ message: 'Sensor no encontrado' });
        }
        return res.status(200).json({ message: 'Lugar eliminado correctamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al eliminar el lugar' });
    }
}

