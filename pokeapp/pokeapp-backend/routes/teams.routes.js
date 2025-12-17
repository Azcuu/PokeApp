import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth-middleware.js';
import { 
  getAllTeams, 
  getUserTeams, 
  getTeamById, 
  createTeam, 
  updateTeam, 
  deleteTeam
} from '../controllers/teams.controllers.js';

const router = Router();

// Rutas públicas
router.get('/', getAllTeams);
router.get('/:id', getTeamById);

// Rutas protegidas
router.use(authMiddleware); // Todas las rutas debajo requieren autenticación

router.get('/user/teams', getUserTeams);
router.post('/', createTeam);
router.put('/:id', updateTeam);
router.delete('/:id', deleteTeam);

export default router;