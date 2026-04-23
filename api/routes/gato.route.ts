import {Request, Response, Router } from 'express';
import * as gatoController from "../controllers/gato.controller.js";
import verifyJWT from '../middlewares/jwt.token.middleware.js';
import { upload } from '../database/configupload.js';

const router = Router();

router.post("/", verifyJWT, upload.single("imagem"), gatoController.criarGato);
router.get("/", gatoController.listarGatos);

export default router;