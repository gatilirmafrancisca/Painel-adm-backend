import Gato, {IGato} from "../models/Gato.js";
import ResponseType from "../types/response.type.js";
import { Types, Document } from "mongoose";
import { Request } from "express";
import { cloudinary } from '../database/configupload.js';
import streamifier from 'streamifier';
import { montarFiltrosGato, normalizarPersonalidades, validarParametros, validarParametrosPatch } from "../utils/gatovalidar.js";

const localizarGato = async(id?: string, filters: any = {}) : Promise<(IGato & Document)[]> => {
    
    if (id) {

        if (!Types.ObjectId.isValid(id)) {
            return [];
        }

        const gato = await Gato.findOne({ _id: id, ...filters });
        return gato ? [gato] : [];
    }
    return await Gato.find(filters);

}


const uploadFromBuffer = (reqFile: Express.Multer.File): Promise<any> => {
    return new Promise((resolve, reject) => {
        const cld_upload_stream = cloudinary.uploader.upload_stream(
          { folder: 'gatil_images' },
          (error: any, result: any) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        streamifier.createReadStream(reqFile.buffer).pipe(cld_upload_stream);
    });
};


export const criarGatoService = async (data: IGato, req: Request) : Promise<ResponseType> => {
    try {

        const file = req.file;

        if (!file) {return {status: 400, message: "A imagem é obrigatória."};}

        await validarParametros({...data, personalidade: normalizarPersonalidades(data.personalidade)});

        const personalidades = normalizarPersonalidades(data.personalidade);
        const result = await uploadFromBuffer(file);

        const dadosGato = new Gato({
          ...data,
          imagemUrl: result.secure_url,
          personalidade: personalidades
        });

        // Criar gato com dados originais e sobrescrever campos modificados
        const gatoNovo = new Gato(dadosGato);
        await gatoNovo.save();

        return {status: 201, message: "Gato cadastrado com sucesso.", data: { nome: gatoNovo.nome, id: gatoNovo._id }}

    }catch(error: any) {

        console.error("criarGatoService error:", error);
        throw error;
    }
}

export const listarGatosService = async (req: any): Promise<ResponseType> => {
    try {

      const { query } = req;
      const filters = montarFiltrosGato(query);

      const gatos = await localizarGato(undefined, filters);

      if (gatos.length === 0) {
        return { status: 404, message: "Nenhum gato encontrado." };
      }

      return { status: 200, message: "Gatos listados com sucesso.", data: gatos };

    } catch (error: any) {

        console.error("listarGatosService error:", error);
        throw error;

    }
  }