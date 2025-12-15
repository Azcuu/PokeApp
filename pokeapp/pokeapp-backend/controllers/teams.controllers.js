import { getAllDBTeams, getDBTeamById, createDBTeam } from '../models/pokeapp.models.js';

export async function getAllTeams(req, res) {
    try {
        const teams = await getAllDBTeams();
        res.json(teams);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo equipos' });
    }
}

export async function getTeamById(req, res) {
    try {
        const teamId = req.params.id;
        const team = await getDBTeamById(teamId);
        
        if (!team) {
            return res.status(404).json({ error: 'Equipo no encontrado' });
        }
        
        res.json(team);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo equipo' });
    }
}

export async function createTeam(req, res) {
    try {
        const teamData = req.body;
        const newTeam = await createDBTeam(teamData);
        res.status(201).json(newTeam);
    } catch (error) {
        res.status(500).json({ error: 'Error creando equipo' });
    }
}
