import { Router } from 'express';
import { getAllPokemon, getPokemonById } from '../controllers/pokemons.controllers.js';

const router = Router();

router.get('/', getAllPokemon);

router.get('/:id', getPokemonById);

export default router;