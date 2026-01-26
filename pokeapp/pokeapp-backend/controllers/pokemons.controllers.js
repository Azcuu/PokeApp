import {
  getAllDBPokemon,
  getDBPokemonById
} from '../models/pokemon.models.js';

/* =========================
   Pokemon Controllers
========================= */
export async function getAllPokemon(req, res) {
  try {
    const pokemons = await getAllDBPokemon();

    res.json({
      success: true,
      data: pokemons
    });

  } catch (error) {
    console.error('[GET /pokemon] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo la lista de pokémons'
    });
  }
}

export async function getPokemonById(req, res) {
  try {
    const pokemonId = Number(req.params.id);

    if (!Number.isFinite(pokemonId)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido'
      });
    }

    const pokemon = await getDBPokemonById(pokemonId);

    if (!pokemon) {
      return res.status(404).json({
        success: false,
        message: 'Pokémon no encontrado'
      });
    }

    res.json({
      success: true,
      data: pokemon
    });

  } catch (error) {
    console.error('[GET /pokemon/:id] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo Pokémon'
    });
  }
}
