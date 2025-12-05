import { Router } from 'express';
import { getAllTeams, getTeamById, createTeam } from '../controllers/teams.controllers.js';
import { logRequestParams } from '../middlewares/params-middleware.js';

const router = Router();

router.get('/', logRequestParams, getAllTeams);

router.get('/:id', logRequestParams, getTeamById);

router.post('/', logRequestParams, createTeam);

export default router;