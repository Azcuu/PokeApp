import { getAllDBTeams, getDBTeamById, createDBTeam } from '../models/pokeapp.models.js';

export function getAllTeams(req, res) {
    const teams = getAllDBTeams();
    res.json(teams);
}

export function getTeamById(req, res) {
    const teamId = req.params.id;
    const team = getDBTeamById(teamId);
    res.json(team);
}

export async function createTeam(req, res) {
    const teamData = req.body;
    const newTeam = await createDBTeam(teamData);
    res.status(201).json(newTeam);
}