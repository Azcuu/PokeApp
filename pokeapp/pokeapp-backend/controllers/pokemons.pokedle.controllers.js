import { getAllDBPokemon } from '../models/pokemon.models.js';

/* =========================
   Pokedle Controller
========================= */
export async function getPokemonsForPokedle(req, res) {
  try {
    const pokemons = await getAllDBPokemon();

    const pokedlePokemons = (pokemons || []).map(pokemon => ({
      id: pokemon.id,
      name: pokemon.name,
      type: pokemon.type,
      base: pokemon.base,
      image: pokemon.image
    }));

    res.json({
      success: true,
      data: pokedlePokemons
    });

  } catch (error) {
    console.error('[GET /pokemons/pokedle] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cargando pokémons para Pokedle'
    });
  }
}
