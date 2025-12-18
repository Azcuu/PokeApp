import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth-middleware.js';
import {
  getAllTeams,
  getUserTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
} from '../controllers/teams.controllers.js';

const router = Router();


router.get('/', getAllTeams);


router.get('/user', authMiddleware, getUserTeams);
router.post('/', authMiddleware, createTeam);
router.put('/:id', authMiddleware, updateTeam);
router.delete('/:id', authMiddleware, deleteTeam);
router.get('/:id', getTeamById);

export default router;
