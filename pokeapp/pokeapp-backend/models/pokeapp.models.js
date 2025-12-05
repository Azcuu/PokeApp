import { mongodbInstance } from "../infraestructure/mongodb-connection.js";


const pokemonSchema = new mongodbInstance.Schema({
    id: Number,
    name: String,
});

const teamSchema = new mongodbInstance.Schema({
    pokemons: [pokemonSchema],
});

export const PokemonModel = mongodbInstance.model('Pokemon', pokemonSchema);
export const TeamModel = mongodbInstance.model('Team', teamSchema);

export async function getAllDBPokemon() {
    return PokemonModel.find().lean();
}

export async function getDBPokemonById(id) {
    return PokemonModel.findOne({ id }).lean();
}

export async function getAllDBTeams() {
    return TeamModel.find().lean();
}

export async function getDBTeamById(id) {
    return TeamModel.findById(id).lean();
}

export async function createDBTeam(pokemonData) {
    const team = new TeamModel(pokemonData);
    return team.save();
}