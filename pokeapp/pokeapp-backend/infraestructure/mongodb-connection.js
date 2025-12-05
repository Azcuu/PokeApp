import moongoose from 'mongoose';

export async function connectToDatabase() {
    moongoose.connect('mongodb://localhost:27017/pokeapp1')   
}
    
export const mongodbInstance = moongoose;