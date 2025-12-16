import mongoose from 'mongoose';

export async function connectToDatabase() {
    mongoose.connect('mongodb://localhost:27017/PokeApp')
}
export const mongodbInstance = mongoose;