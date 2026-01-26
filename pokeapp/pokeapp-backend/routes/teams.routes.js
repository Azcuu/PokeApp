import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth-middleware.js';
import {
  getAllTeams,
  getUserTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  likeTeam,
  removeLike,
  dislikeTeam,
  removeDislike,
  addComment,
  removeComment,
} from '../controllers/teams.controllers.js';

const router = Router();

router.get('/', getAllTeams);
router.get('/user', authMiddleware, getUserTeams);

router.post('/', authMiddleware, createTeam);
router.put('/:id', authMiddleware, updateTeam);
router.delete('/:id', authMiddleware, deleteTeam);

router.post('/:id/like', authMiddleware, likeTeam);
router.delete('/:id/like', authMiddleware, removeLike);

router.post('/:id/dislike', authMiddleware, dislikeTeam);
router.delete('/:id/dislike', authMiddleware, removeDislike);
router.post('/:id/comments', authMiddleware, addComment);
router.delete('/:id/comments/:commentId', authMiddleware, removeComment);

router.get('/:id', authMiddleware, getTeamById); 


export default router;
