import mongoose from 'mongoose';
import { mongodbInstance } from "../infraestructure/mongodb-connection.js";

const nameSchema = new mongodbInstance.Schema({
    english: String,
    japanese: String,
    chinese: String,
    french: String
}, { _id: false });

const baseStatsSchema = new mongodbInstance.Schema({
    HP: Number,
    Attack: Number,
    Defense: Number,
    "Sp. Attack": Number,
    "Sp. Defense": Number,
    Speed: Number
}, { _id: false });

const evolutionSchema = new mongodbInstance.Schema({
    next: [[String]]
}, { _id: false });

const profileSchema = new mongodbInstance.Schema({
    height: String,
    weight: String,
    egg: [String],
    ability: [[String]],
    gender: String
}, { _id: false });

const imageSchema = new mongodbInstance.Schema({
    sprite: String,
    thumbnail: String,
    hires: String
}, { _id: false });

// Esquema principal de Pokemon
const pokemonSchema = new mongodbInstance.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: nameSchema,
        required: true
    },
    type: {
        type: [String],
        required: true
    },
    base: {
        type: baseStatsSchema,
        required: true
    },
    species: String,
    description: String,
    evolution: evolutionSchema,
    profile: profileSchema,
    image: imageSchema
}, {
    timestamps: true
});

export const PokemonModel = mongodbInstance.model('Pokemons', pokemonSchema);

// Funcions
export async function getAllDBPokemon() {
    console.log('Buscando pokemones...');
    const data = await PokemonModel.find().sort({ id: 1 }).lean();
    console.log('Pokemones encontrados:', data.length, data);
    return data;
}

export async function getDBPokemonById(id) {
    return PokemonModel.findOne({ id }).lean();
}

export async function getDBPokemonByType(type) {
    return await PokemonModel.find({ type }).lean();
}

export async function searchDBPokemonByName(name) {
    return await PokemonModel.find({"name.english": { $regex: name, $options: 'i' }}).lean();
}