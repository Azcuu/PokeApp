import { Router } from 'express';
import { getAllPokemon, getPokemonById } from '../controllers/pokemons.controllers.js';
import { getPokemonsForPokedle } from '../controllers/pokemons.pokedle.controllers.js';

const router = Router();

router.get('/pokedle', getPokemonsForPokedle);

router.get('/', getAllPokemon);
router.get('/:id', getPokemonById);

export default router;
