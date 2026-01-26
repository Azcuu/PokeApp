import mongoose from 'mongoose';

export async function connectToDatabase() {
    await mongoose.connect('mongodb://localhost:27017/PokeApp')
}
export const mongodbInstance = mongoose;