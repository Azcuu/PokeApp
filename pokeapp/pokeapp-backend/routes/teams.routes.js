import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth-middleware.js';
import {
  getAllTeams,
  getUserTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  addLikeToTeam,
  removeLikeFromTeam,
  addDislikeToTeam,
  removeDislikeFromTeam,
  addCommentToTeam,
  removeCommentFromTeam,
} from '../controllers/teams.controllers.js';

const router = Router();

router.get('/', getAllTeams);
router.get('/user', authMiddleware, getUserTeams);

router.post('/', authMiddleware, createTeam);
router.put('/:id', authMiddleware, updateTeam);
router.delete('/:id', authMiddleware, deleteTeam);

router.get('/:id', getTeamById);

router.post('/:id/like', authMiddleware, addLikeToTeam);
router.delete('/:id/like', authMiddleware, removeLikeFromTeam);

router.post('/:id/dislike', authMiddleware, addDislikeToTeam);
router.delete('/:id/dislike', authMiddleware, removeDislikeFromTeam);

router.post('/:id/comment', authMiddleware, addCommentToTeam);
router.delete('/:id/comment/:commentId', authMiddleware, removeCommentFromTeam);

export default router;
