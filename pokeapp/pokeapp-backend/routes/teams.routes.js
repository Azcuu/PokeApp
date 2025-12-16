import { Router } from 'express';
import { getAllTeams, getTeamById, createTeam } from '../controllers/teams.controllers.js';

const router = Router();

router.get('/', getAllTeams);

router.get('/:id', getTeamById);

router.post('/', createTeam);
export default router;