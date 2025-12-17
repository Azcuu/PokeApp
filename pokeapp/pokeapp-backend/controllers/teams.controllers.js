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
    
    // Búsqueda por texto
    if (search) {
      query.$text = { $search: search };
    }
    
    // Filtro por tag
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
    
    res.json({ 
      success: true, 
      data: team
    });
    
  } catch (error) {
    console.error('Error obteniendo equipo:', error);
    res.status(500).json({ error: 'Error obteniendo equipo' });
  }
}

export async function createTeam(req, res) {
  try {
    const { name, description, pokemonIds, tags, isPublic } = req.body;
    
    // Validar que no haya más de 6 Pokémon
    if (pokemonIds && pokemonIds.length > 6) {
      return res.status(400).json({ error: 'Máximo 6 Pokémon por equipo' });
    }
    
    // Buscar los Pokémon en la DB
    const pokemons = await PokemonModel.find({ 
      id: { $in: pokemonIds } 
    }).lean();
    
    // Mapear a la estructura del equipo
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
    
    // Verificar que el usuario es el creador
    if (team.creator.toString() !== req.userId) {
      return res.status(403).json({ error: 'No autorizado para editar este equipo' });
    }
    
    const { name, description, pokemonIds, tags, isPublic } = req.body;
    
    // Validar límite de Pokémon
    if (pokemonIds && pokemonIds.length > 6) {
      return res.status(400).json({ error: 'Máximo 6 Pokémon por equipo' });
    }
    
    // Actualizar campos básicos
    team.name = name || team.name;
    team.description = description !== undefined ? description : team.description;
    team.tags = tags || team.tags;
    team.isPublic = isPublic !== undefined ? isPublic : team.isPublic;
    
    // Actualizar Pokémon si se proporcionan nuevos IDs
    if (pokemonIds) {
      const pokemons = await PokemonModel.find({ 
        id: { $in: pokemonIds } 
      }).lean();
      
      team.pokemons = pokemons.map(p => ({
        pokemonId: p.id,
        name: p.name.english,
        sprite: p.image?.sprite || p.image?.thumbnail || ''
      }));
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
    
    // Verificar que el usuario es el creador
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