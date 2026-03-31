import Gato, {IGato} from "../models/Gato.js";
import ResponseType from "../types/response.type.js";
import { Types, Document } from "mongoose";
import { Request } from "express";
import { cloudinary } from '../database/configupload.js';
import streamifier from 'streamifier';
import { normalizarPersonalidades, validarParametros, validarParametrosPatch } from "../utils/gatovalidar.js";

export const criarGatoService = async (data: IGato, req: Request) : Promise<ResponseType> => {
    try {

        const file = req.file;

        if (!file) {return {status: 400, message: "A imagem é obrigatória."};}
        
        validarParametros(data);
        const personalidades = normalizarPersonalidades(data.personalidade);

        const gato = new Gato(data, {});

    }catch(error: any) {

        console.error("criarGatoService error:", error);
        throw error;
    }
}