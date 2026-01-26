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

    let query = {};

    if (search) {
      query.$text = { $search: search };
    }

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
    res.status(500).json({ success: false, message: 'Error obteniendo equipos' });
  }
}

export async function getUserTeams(req, res) {
  try {
    const teams = await TeamModel.find({ creator: req.userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: teams });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error obteniendo tus equipos' });
  }
}

export async function getTeamById(req, res) {
  try {
    const userId = req.userId;
    const team = await TeamModel.findById(req.params.id)
      .populate('creator', 'username')
      .populate('comments.user', 'username')
      .lean();

    if (!team) {
      return res.status(404).json({ success: false, message: 'Equipo no encontrado' });
    }

    const pokemonIds = team.pokemons.map(p => p.pokemonId);

    const pokemonsFull = await PokemonModel.find({
      id: { $in: pokemonIds }
    })
      .select('id type base')
      .lean();

    const pokemonMap = new Map(
      pokemonsFull.map(p => [p.id, p])
    );

    team.pokemons = team.pokemons.map(p => ({
      ...p,
      type: pokemonMap.get(p.pokemonId)?.type || [],
      base: pokemonMap.get(p.pokemonId)?.base || {}
    }));

    res.json({
      success: true,
      data: {
        ...team,
        hasLiked: userId ? team.likes.includes(userId) : false,
        hasDisliked: userId ? team.dislikes.includes(userId) : false
      }
    });

  } catch (error) {
    console.error('Error obteniendo equipo:', error);
    res.status(500).json({ success: false, message: 'Error obteniendo equipo' });
  }
}

export async function createTeam(req, res) {
  try {
    const { name, description, pokemonIds, tags } = req.body;

    if (pokemonIds && pokemonIds.length > 6) {
      return res.status(400).json({ success: false, message: 'Máximo 6 Pokémon por equipo' });
    }

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
    res.status(500).json({ success: false, message: 'Error creando equipo' });
  }
}

export async function updateTeam(req, res) {
  try {
    const team = await TeamModel.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ success: false, message: 'Equipo no encontrado' });
    }

    if (team.creator.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'No autorizado para editar este equipo' });
    }

    const { name, description, tags, pokemonIds, pokemons } = req.body;

    if (name !== undefined) team.name = name;
    if (description !== undefined) team.description = description;
    if (tags !== undefined) team.tags = tags;

    if (Array.isArray(pokemonIds)) {
      if (pokemonIds.length > 6) {
        return res.status(400).json({ success: false, message: 'Máximo 6 Pokémon por equipo' });
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
        return res.status(400).json({ success: false, message: 'Máximo 6 Pokémon por equipo' });
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
    res.status(500).json({ success: false, message: 'Error actualizando equipo' });
  }
}

export async function deleteTeam(req, res) {
  try {
    const team = await TeamModel.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ success: false, message: 'Equipo no encontrado' });
    }

    if (team.creator.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'No autorizado para eliminar este equipo' });
    }

    await TeamModel.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Equipo eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando equipo:', error);
    res.status(500).json({ success: false, message: 'Error eliminando equipo' });
  }
}

/* -------------------- LIKES / DISLIKES -------------------- */

export async function likeTeam(req, res) {
  try {
    const team = await TeamModel.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Equipo no encontrado' });

    const userId = req.userId;

    if (!team.likes.includes(userId)) {
      team.likes.push(userId);
      team.dislikes = team.dislikes.filter(u => u.toString() !== userId);
      await team.save();
    }

    res.json({ success: true, likes: team.likes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function dislikeTeam(req, res) {
  try {
    const team = await TeamModel.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Equipo no encontrado' });

    const userId = req.userId;

    if (!team.dislikes.includes(userId)) {
      team.dislikes.push(userId);
      team.likes = team.likes.filter(u => u.toString() !== userId);
      await team.save();
    }

    res.json({ success: true, dislikes: team.dislikes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function removeLike(req, res) {
  try {
    const team = await TeamModel.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Equipo no encontrado' });

    const userId = req.userId;
    team.likes = team.likes.filter(u => u.toString() !== userId);
    await team.save();

    res.json({ success: true, likes: team.likes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function removeDislike(req, res) {
  try {
    const team = await TeamModel.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Equipo no encontrado' });

    const userId = req.userId;
    team.dislikes = team.dislikes.filter(u => u.toString() !== userId);
    await team.save();

    res.json({ success: true, dislikes: team.dislikes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/* -------------------- COMMENTS -------------------- */

export async function addComment(req, res) {
  try {
    const { comment } = req.body;
    if (!comment?.trim()) {
      return res.status(400).json({ success: false, message: 'Comentario vacío' });
    }

    const team = await TeamModel.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Equipo no encontrado' });

    team.comments.push({
      user: req.userId,
      text: comment
    });

    await team.save();

    res.json({ success: true, comments: team.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function removeComment(req, res) {
  try {
    const { commentId } = req.params;

    const team = await TeamModel.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Equipo no encontrado' });

    const comment = team.comments.id(commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comentario no encontrado' });

    if (comment.user.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'No autorizado para eliminar este comentario' });
    }

    comment.remove();
    await team.save();

    res.json({ success: true, comments: team.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
