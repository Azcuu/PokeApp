import { getAllDBPokemon, getDBPokemonById } from '../models/pokeapp.models.js';

export function getAllPokemon(req, res) {
    const pokemon = getAllDBPokemon();
    res.json(pokemon);
}

export function getPokemonById(req, res) {
    const pokemonId = parseInt(req.params.id);
    const pokemon = getDBPokemonById(pokemonId);
    res.json(pokemon);
}



