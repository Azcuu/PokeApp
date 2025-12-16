import { getAllDBPokemon, getDBPokemonById } from '../models/pokeapp.models.js';

export async function getAllPokemon(req, res) {
   try {
        const pokemons = await getAllDBPokemon();
        res.json(pokemons);
    } catch (error) {
        console.error('Error al obtener pokémons:', error);
        res.status(500).json({ error: 'Error obteniendo la lista de pokémons' });
    }
}

export async function getPokemonById(req, res) {
    try {
        const pokemonId = parseInt(req.params.id);
        const pokemon = await getDBPokemonById(pokemonId);
        
        if (!pokemon) {
            return res.status(404).json({ error: 'Pokémon no encontrado' });
        }
        
        res.json(pokemon);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error obteniendo Pokémon' });
    }
}



