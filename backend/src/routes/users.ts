import { Router } from 'express';
import { getAllUsers, createUser } from '../controllers/userController';

const router = Router();
router.get('/', getAllUsers); // GET /api/users
router.post('/', createUser); // ← ¡ESTO ES LO QUE FALTA!
export default router;