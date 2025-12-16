import { mongodbInstance } from "../infraestructure/mongodb-connection.js";

const nameSchema = new mongodbInstance.Schema({
    english: String,
    japanese: String,
    chinese: String,
    french: String
});

const baseStatsSchema = new mongodbInstance.Schema({
    HP: Number,
    Attack: Number,
    Defense: Number,
    "Sp. Attack": Number,
    "Sp. Defense": Number,
    Speed: Number
});

const evolutionSchema = new mongodbInstance.Schema({
    next: [[String]] 
});

const profileSchema = new mongodbInstance.Schema({
    height: String,
    weight: String,
    egg: [String],
    ability: [[String]], 
    gender: String
});

const imageSchema = new mongodbInstance.Schema({
    sprite: String,
    thumbnail: String,
    hires: String
});

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
    timestamps: true // Opcional: añade createdAt y updatedAt automáticamente
});

const teamSchema = new mongodbInstance.Schema({
    name: {
        type: String,
        default: "Mi Equipo"
    },
    pokemons: [{
        type: Number, // Ahora guardamos solo los IDs de los Pokémon
        ref: 'Pokemon' // Referencia al modelo Pokémon
    }],
    description: String,
    createdBy: String
}, {
    timestamps: true
});

pokemonSchema.index({ id: 1 });
pokemonSchema.index({ "name.english": 1 });
pokemonSchema.index({ type: 1 });
teamSchema.index({ createdBy: 1 });

export const PokemonModel = mongodbInstance.model('Pokemon', pokemonSchema, 'Pokemons');
export const TeamModel = mongodbInstance.model('Team', teamSchema, 'Teams');

export async function getAllDBPokemon() {
    return PokemonModel.find().sort({ id: 1 }).lean();
}

export async function getDBPokemonById(id) {
    return PokemonModel.findOne({ id }).lean();
}

export async function getDBPokemonByType(type) {
    return await PokemonModel.find({ type }).lean();
}

export async function searchDBPokemonByName(name) {
    return await PokemonModel.find({
        $or: [
            { "name.english": { $regex: name, $options: 'i' } },
            { "name.japanese": { $regex: name, $options: 'i' } }
        ]
    }).lean();
}

export async function getAllDBTeams() {
    return TeamModel.find().populate('pokemons').lean();
}

export async function getDBTeamById(id) {
    return TeamModel.findById(id).populate('pokemons').lean();
}

export async function createDBTeam(teamData) {
    const team = new TeamModel(teamData);
    return team.save();
}