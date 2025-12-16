import moongoose from 'mongoose';

export async function connectToDatabase() {
    moongoose.connect('mongodb://localhost:27017/PokeApp')   
}
    
export const mongodbInstance = moongoose;