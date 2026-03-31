import { Request, Response, Router } from 'express';
import { JWTController } from '../controllers/protected.controller.js';
import verifyJWT from '../middlewares/jwt.token.middleware.js';


const router = Router();

router.get('/', verifyJWT, JWTController);

export default router;