import { getAllDBPokemon } from '../models/pokemon.models.js';

export async function getPokemonsForPokedle(req, res) {
  try {
    const pokemons = await getAllDBPokemon();

    const light = (pokemons || []).map(p => ({
      id: p.id,
      name: p.name,
      type: p.type,
      base: p.base,
      image: p.image
    }));

    res.json(light);
  } catch (error) {
    console.error('Error /pokemons/pokedle:', error);
    res.status(500).json({ error: 'Error cargando pokemons para pokedle' });
  }
}
