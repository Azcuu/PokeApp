import { TeamModel } from '../models/teams.models.js';
import { PokemonModel } from '../models/pokemon.models.js';

export async function getAllTeams(req, res) {
  try {
    const { 
      page = 1, 
      limit = 20, 
      sort = 'createdAt', 
      order = 'desc',
      search = '',
      tag = ''
    } = req.query;
    
    const skip = (page - 1) * limit;
    const sortOrder = order === 'desc' ? -1 : 1;
    
    let query = { isPublic: true };
    
    // Buscar per text
    if (search) {
      query.$text = { $search: search };
    }
    
    // Filtre per tag
    if (tag) {
      query.tags = tag;
    }
    
    const teams = await TeamModel.find(query)
      .populate('creator', 'username')
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const total = await TeamModel.countDocuments(query);
    
    res.json({
      success: true,
      data: teams,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error obteniendo equipos:', error);
    res.status(500).json({ error: 'Error obteniendo equipos' });
  }
}

export async function getUserTeams(req, res) {
  try {
    const teams = await TeamModel.find({ creator: req.userId })
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({ success: true, data: teams });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo tus equipos' });
  }
}

export async function getTeamById(req, res) {
  try {
    const team = await TeamModel.findById(req.params.id)
      .populate('creator', 'username');
    
    if (!team) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }
    
    const pokemonIds = team.pokemons.map(p => p.pokemonId);
    
    const pokemonsFull = await PokemonModel.find({ 
      id: { $in: pokemonIds } 
    })
    .select('id name.english image.sprite type base') // Solo los campos necesarios
    .lean();
    
    const pokemonMap = new Map();
    pokemonsFull.forEach(pokemon => {
      pokemonMap.set(pokemon.id, {
        type: pokemon.type || [],
        base: pokemon.base || {}
      });
    });
    
    const teamWithPokemonData = {
      ...team.toObject(),
      pokemons: team.pokemons.map(p => ({
        ...p.toObject ? p.toObject() : p,
        type: pokemonMap.get(p.pokemonId)?.type || [],
        base: pokemonMap.get(p.pokemonId)?.base || {}
      }))
    };
    
    res.json({ 
      success: true, 
      data: teamWithPokemonData
    });
    
  } catch (error) {
    console.error('Error obteniendo equipo:', error);
    res.status(500).json({ error: 'Error obteniendo equipo' });
  }
}

export async function createTeam(req, res) {
  try {
    const { name, description, pokemonIds, tags, isPublic } = req.body;
    
    // Verficar que no hi hagi més de 6 Pokémon
    if (pokemonIds && pokemonIds.length > 6) {
      return res.status(400).json({ error: 'Máximo 6 Pokémon por equipo' });
    }
    
    // Buscar els Pokemon en DB
    const pokemons = await PokemonModel.find({ 
      id: { $in: pokemonIds } 
    }).lean();
    
    const teamPokemons = pokemons.map(p => ({
      pokemonId: p.id,
      name: p.name.english,
      sprite: p.image?.sprite || p.image?.thumbnail || ''
    }));
    
    const team = new TeamModel({
      name,
      description: description || '',
      pokemons: teamPokemons,
      tags: tags || [],
      isPublic: isPublic !== undefined ? isPublic : true,
      creator: req.userId,
      creatorName: req.username
    });
    
    await team.save();
    
    res.status(201).json({
      success: true,
      data: team,
      message: 'Equipo creado exitosamente'
    });
    
  } catch (error) {
    console.error('Error creando equipo:', error);
    res.status(500).json({ error: 'Error creando equipo' });
  }
}

export async function updateTeam(req, res) {
  try {
    const team = await TeamModel.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    if (team.creator.toString() !== req.userId) {
      return res.status(403).json({ error: 'No autorizado para editar este equipo' });
    }

    const { name, description, tags, pokemonIds, pokemons } = req.body;

    if (name !== undefined) team.name = name;
    if (description !== undefined) team.description = description;
    if (tags !== undefined) team.tags = tags;

 
    if (Array.isArray(pokemonIds)) {
      if (pokemonIds.length > 6) {
        return res.status(400).json({ error: 'Máximo 6 Pokémon por equipo' });
      }

      const ids = pokemonIds.map(n => Number(n)).filter(n => Number.isFinite(n));

      const found = await PokemonModel.find({ id: { $in: ids } }).lean();

      const teamPokemons = found.map(p => ({
        pokemonId: p.id,
        name: p.name.english,
        sprite: p.image?.sprite || p.image?.thumbnail || ''
      }));

      team.pokemons = teamPokemons;
      team.markModified('pokemons');
    }
    
    else if (Array.isArray(pokemons)) {
      if (pokemons.length > 6) {
        return res.status(400).json({ error: 'Máximo 6 Pokémon por equipo' });
      }

      team.pokemons = pokemons.map(p => ({
        pokemonId: Number(p.pokemonId ?? p.id),
        name: p.name,
        sprite: p.sprite
      }));
      team.markModified('pokemons');
    }

    await team.save();

    res.json({
      success: true,
      data: team,
      message: 'Equipo actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error actualizando equipo:', error);
    res.status(500).json({ error: 'Error actualizando equipo' });
  }
}




export async function deleteTeam(req, res) {
  try {
    const team = await TeamModel.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }
    
    if (team.creator.toString() !== req.userId) {
      return res.status(403).json({ error: 'No autorizado para eliminar este equipo' });
    }
    
    await TeamModel.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Equipo eliminado exitosamente'
    });
    
  } catch (error) {
    console.error('Error eliminando equipo:', error);
    res.status(500).json({ error: 'Error eliminando equipo' });
  }
}