import Car from '../models/Car.js';

export const createCar = async (req, res) => {
    const { userId, plate, model, brand, color, isMain } = req.body;
    try {
        if (!userId || !plate || !model || !brand) {
            return res.status(400).json({ message: 'Todos los campos son requeridos' });
        }
        const car = new Car({ userId, plate, model, brand, color, isMain });
        await car.save();
        return res.status(201).json({ message: 'Carro creado correctamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al crear el carro' });
    }
}

export const getCarsForUser = async (req, res) => {
    const userId  = req.params.userId;
    try {
        if (!userId) {
            return res.status(400).json({ message: 'El userId es requerido' });
        }
        const cars = await Car.find({ userId: userId }).lean();
        const carsData = cars.map(car => {
            return {
                id: car._id,
                plate: car.plate,
                model: car.model,
                brand: car.brand,
                color: car.color,
                isMain: car.isMain,
            }
        });
        return res.status(200).json({ data: carsData, message: 'Carros obtenidos correctamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener los carros' });
    }
}

export const updateCar = async (req, res) => {
    const { userId, plate, model, brand, color, isMain } = req.body;
    const id = req.params.id;
    try {
        if (!userId || !plate || !model || !brand) {
            return res.status(400).json({ message: 'Todos los campos son requeridos' });
        }
        const car = await Car.findOne({ userId: userId, _id: id });
        if (!car) {
            return res.status(404).json({ message: 'Carro no encontrado' });
        }
        car.plate = plate;
        car.model = model;
        car.brand = brand;
        car.color = color;

        if (isMain === true) {
            const otherMainCars = await Car.find({ 
                userId: userId, 
                isMain: true, 
                _id: { $ne: id }
            });
            
            if (otherMainCars.length > 0) {
                await Car.updateMany(
                    { 
                        userId: userId, 
                        isMain: true, 
                        _id: { $ne: id }
                    }, 
                    { isMain: false }
                );
            }
        }

        car.isMain = isMain;
        await car.save();
        
        return res.status(200).json({ message: 'Carro actualizado correctamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al actualizar el carro' });
    }
}

export const deleteCar = async (req, res) => {
    const id = req.params.id;
    try {
        const carDeleted = await Car.findByIdAndDelete(id);

        if (carDeleted) {
            return res.status(200).json({data: carDeleted.plate, message: 'Carro eliminado correctamente' });
        } else {
            return res.status(404).json({ message: 'Carro no encontrado' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al eliminar el carro' });
    }
}

export const updateMainCar = async (req, res) => {
    const id = req.params.id;
    const { isMain } = req.body;
    try {
        const car = await Car.findOne({ _id: id });
        if (!car) {
            return res.status(404).json({ message: 'Carro no encontrado' });
        }
        
        if (isMain === true) {
            const otherMainCars = await Car.find({ 
                userId: car.userId, 
                isMain: true, 
                _id: { $ne: id }
            });
            
            if (otherMainCars.length > 0) {
                await Car.updateMany(
                    { 
                        userId: car.userId, 
                        isMain: true, 
                        _id: { $ne: id }
                    }, 
                    { isMain: false }
                );
            }
        }
        
        car.isMain = isMain;
        await car.save();
        return res.status(200).json({ message: 'Carro actualizado correctamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al actualizar el carro principal' });
    }
}