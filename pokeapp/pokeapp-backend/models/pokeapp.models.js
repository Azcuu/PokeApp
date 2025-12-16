import mongoose from 'mongoose';
import { mongodbInstance } from "../infraestructure/mongodb-connection.js";

// Sub-esquemas (usamos { _id: false } para no generar IDs innecesarios en subdocumentos)
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

// Esquema principal de Pokémon
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

// Esquema de Equipo
const teamSchema = new mongodbInstance.Schema({
    name: {
        type: String,
        default: "Mi Equipo"
    },
    pokemons: [{
        // CAMBIO CRÍTICO: Usamos ObjectId para que funcione la referencia
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pokemon'
    }],
    description: String,
    createdBy: String
}, {
    timestamps: true
});


export const PokemonModel = mongodbInstance.model('Pokemons', pokemonSchema);
export const TeamModel = mongodbInstance.model('Teams', teamSchema);

// Funciones
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

export async function getAllDBTeams() {
    // Populate buscará por _id en la colección Pokemons
    return TeamModel.find().populate('pokemons').lean();
}

export async function getDBTeamById(id) {
    return TeamModel.findById(id).populate('pokemons').lean();
}

export async function createDBTeam(teamData) {
    const team = new TeamModel(teamData);
    return team.save();
}