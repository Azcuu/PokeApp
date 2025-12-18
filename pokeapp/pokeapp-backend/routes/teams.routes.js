import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth-middleware.js';
import {
  getAllTeams,
  getUserTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  addComment,
  likeTeam,
} from '../controllers/teams.controllers.js';

const router = Router();


router.get('/', getAllTeams);


router.get('/user/teams', authMiddleware, getUserTeams);
router.post('/', authMiddleware, createTeam);
router.put('/:id', authMiddleware, updateTeam);
router.delete('/:id', authMiddleware, deleteTeam);
router.post('/:id/comment', authMiddleware, addComment);
router.post('/:id/like', authMiddleware, likeTeam);


router.get('/:id', getTeamById);

export default router;
