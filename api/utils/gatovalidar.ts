import { IGato } from "../models/Gato.js";
import * as CatTypes from "../types/cats.types.js";
import { MissingParamsError, InvalidEnumError } from "./errors.js";

// Função para garantir que a personalidade seja sempre um array de strings limpas
export const normalizarPersonalidades = (personalidade: any): CatTypes.PersonalidadeType[] => {
    const arr = Array.isArray(personalidade)
        ? personalidade.map(p => String(p).trim())
        : [String(personalidade || "").trim()];
    return arr as CatTypes.PersonalidadeType[];
};

const parseBooleanQuery = (value: any): boolean | undefined => {
    if (typeof value === "boolean") return value;
    if (typeof value !== "string") return undefined;

    const normalized = value.trim().toLowerCase();

    if (["true", "1", "sim"].includes(normalized)) return true;
    if (["false", "0", "nao", "não"].includes(normalized)) return false;

    return undefined;
};

export const montarFiltrosGato = (query: any): Record<string, any> => {
    const filters: Record<string, any> = {};

    if (!query) return filters;

    if (query.nome) {
        filters.nome = { $regex: String(query.nome).trim(), $options: "i" };
    }

    if (query.idade !== undefined && query.idade !== "") {
        const idade = Number(query.idade);
        if (!Number.isNaN(idade)) filters.idade = idade;
    }

    if (query.sexo && CatTypes.SEXOTYPES.includes(query.sexo as CatTypes.SexoType)) {
        filters.sexo = query.sexo;
    }

    if (query.cor && CatTypes.CORTYPES.includes(query.cor as CatTypes.CorType)) {
        filters.cor = query.cor;
    }

    if (query.castrado !== undefined) {
        const castrado = parseBooleanQuery(query.castrado);
        if (castrado !== undefined) filters.castrado = castrado;
    }

    if (query.vacinado !== undefined) {
        const vacinado = parseBooleanQuery(query.vacinado);
        if (vacinado !== undefined) filters.vacinado = vacinado;
    }

    if (query.vermifugado !== undefined) {
        const vermifugado = parseBooleanQuery(query.vermifugado);
        if (vermifugado !== undefined) filters.vermifugado = vermifugado;
    }

    if (query.fivFelv && CatTypes.FIVFELVTYPES.includes(query.fivFelv as CatTypes.FivFeLVType)) {
        filters.fivFelv = query.fivFelv;
    }

    if (query.personalidade) {
        const fonte = Array.isArray(query.personalidade)
            ? query.personalidade
            : String(query.personalidade)
                .split(",")
                .map((p) => p.trim())
                .filter((p) => p.length > 0);

        const personalidades = normalizarPersonalidades(fonte)
            .filter((p) => CatTypes.PERSONALIDADETYPES.includes(p as CatTypes.PersonalidadeType));

        if (personalidades.length > 0) {
            filters.personalidade = { $all: personalidades };
        }
    }

    if (query.necessidadesEspeciais !== undefined) {
        const necessidadesEspeciais = parseBooleanQuery(query.necessidadesEspeciais);
        if (necessidadesEspeciais !== undefined) filters.necessidadesEspeciais = necessidadesEspeciais;
    }

    if (query.descricaoBio) {
        filters.descricaoBio = { $regex: String(query.descricaoBio).trim(), $options: "i" };
    }

    if (query.status && CatTypes.STATUSTYPES.includes(query.status as CatTypes.StatusType)) {
        filters.status = query.status;
    }

    if (query.imagemUrl) {
        filters.imagemUrl = { $regex: String(query.imagemUrl).trim(), $options: "i" };
    }

    return filters;
};

export const validarParametros = async (data: IGato): Promise<any> => {
    const camposAusentes: string[] = [];

    // Validação de presença (Strings e Arrays)
    if (!data.nome) camposAusentes.push("Nome");
    if (!data.sexo) camposAusentes.push("Sexo");
    if (!data.cor) camposAusentes.push("Cor");
    if (!data.fivFelv) camposAusentes.push("FIV/FeLV");
    if (!data.status) camposAusentes.push("Status");
    if (!data.descricaoBio) camposAusentes.push("Descrição Bio");
    if (!data.personalidade || data.personalidade.length === 0) camposAusentes.push("Personalidade");

    // Validação de presença (Números e Booleanos)
    if (data.idade === undefined || data.idade === null) camposAusentes.push("Idade");
    if (data.castrado === undefined || data.castrado === null) camposAusentes.push("Castrado");
    if (data.vacinado === undefined || data.vacinado === null) camposAusentes.push("Vacinado");
    if (data.vermifugado === undefined || data.vermifugado === null) camposAusentes.push("Vermifugado");
    if (data.necessidadesEspeciais === undefined || data.necessidadesEspeciais === null) camposAusentes.push("Necessidades Especiais");

    if (camposAusentes.length > 0) {
        throw new MissingParamsError(
            `Os seguintes campos obrigatórios estão ausentes ou vazios: ${camposAusentes.join(", ")}.`
        );
    }

    // Validação de Enums referenciando CatTypes
    if (!CatTypes.SEXOTYPES.includes(data.sexo)) {
        throw new InvalidEnumError(`Sexo inválido '${data.sexo}'. Valores permitidos: ${CatTypes.SEXOTYPES.join(", ")}.`);
    }

    if (!CatTypes.CORTYPES.includes(data.cor)) {
        throw new InvalidEnumError(`Cor inválida '${data.cor}'. Valores permitidos: ${CatTypes.CORTYPES.join(", ")}.`);
    }

    if (!CatTypes.FIVFELVTYPES.includes(data.fivFelv)) {
        throw new InvalidEnumError(`FIV/FeLV inválido '${data.fivFelv}'. Valores permitidos: ${CatTypes.FIVFELVTYPES.join(", ")}.`);
    }

    if (!CatTypes.STATUSTYPES.includes(data.status)) {
        throw new InvalidEnumError(`Status inválido '${data.status}'. Valores permitidos: ${CatTypes.STATUSTYPES.join(", ")}.`);
    }

    const personalidadesInvalidas = (data.personalidade || []).filter(p => !CatTypes.PERSONALIDADETYPES.includes(p as CatTypes.PersonalidadeType));
    if (personalidadesInvalidas.length > 0) {
        throw new InvalidEnumError(`Personalidade(s) inválida(s): ${personalidadesInvalidas.join(", ")}. Valores permitidos: ${CatTypes.PERSONALIDADETYPES.join(", ")}.`);
    }
};

export const validarParametrosPatch = async (data: Partial<IGato>): Promise<Partial<IGato>> => {
    if (!data || Object.keys(data).length === 0) return data;

    // Validação de Strings
    if (data.nome !== undefined) {
        data.nome = String(data.nome || "").trim();
        if (!data.nome) throw new MissingParamsError("O nome não pode estar vazio.");
    }

    if (data.descricaoBio !== undefined) {
        data.descricaoBio = String(data.descricaoBio || "").trim();
        if (!data.descricaoBio) throw new MissingParamsError("A descrição não pode estar vazia.");
    }

    if (data.imagemUrl !== undefined) {
        data.imagemUrl = String(data.imagemUrl || "").trim();
        if (!data.imagemUrl) throw new MissingParamsError("A URL da imagem não pode estar vazia.");
    }

    // Validação de Número
    if (data.idade !== undefined) {
        if (typeof data.idade !== 'number' || data.idade < 0) {
            throw new MissingParamsError("A idade deve ser um número válido.");
        }
    }

    // Validação de Enums
    if (data.sexo !== undefined) {
        if (String(data.sexo).trim() === "") throw new MissingParamsError("O sexo não pode estar vazio.");
        if (!CatTypes.SEXOTYPES.includes(data.sexo as any)) {
            throw new InvalidEnumError(`Sexo inválido '${data.sexo}'. Valores permitidos: ${CatTypes.SEXOTYPES.join(", ")}.`);
        }
    }

    if (data.cor !== undefined) {
        if (String(data.cor).trim() === "") throw new MissingParamsError("A cor não pode estar vazia.");
        if (!CatTypes.CORTYPES.includes(data.cor as any)) {
            throw new InvalidEnumError(`Cor inválida '${data.cor}'. Valores permitidos: ${CatTypes.CORTYPES.join(", ")}.`);
        }
    }

    if (data.fivFelv !== undefined) {
        if (String(data.fivFelv).trim() === "") throw new MissingParamsError("O FIV/FeLV não pode estar vazio.");
        if (!CatTypes.FIVFELVTYPES.includes(data.fivFelv as any)) {
            throw new InvalidEnumError(`FIV/FeLV inválido '${data.fivFelv}'. Valores permitidos: ${CatTypes.FIVFELVTYPES.join(", ")}.`);
        }
    }

    if (data.status !== undefined) {
        if (String(data.status).trim() === "") throw new MissingParamsError("O status não pode estar vazio.");
        if (!CatTypes.STATUSTYPES.includes(data.status as any)) {
            throw new InvalidEnumError(`Status inválido '${data.status}'. Valores permitidos: ${CatTypes.STATUSTYPES.join(", ")}.`);
        }
    }

    // Validação de Array de Enums
    if (data.personalidade !== undefined) {
        const personalidades = normalizarPersonalidades(data.personalidade);
        if (personalidades.length === 0 || personalidades.every(p => String(p).trim() === "")) {
            throw new MissingParamsError("A personalidade não pode estar vazia.");
        }

        const personalidadesInvalidas = personalidades.filter(p => !CatTypes.PERSONALIDADETYPES.includes(p as CatTypes.PersonalidadeType));
        if (personalidadesInvalidas.length > 0) {
            throw new InvalidEnumError(`Personalidade(s) inválida(s): ${personalidadesInvalidas.join(", ")}. Valores permitidos: ${CatTypes.PERSONALIDADETYPES.join(", ")}.`);
        }

        data.personalidade = personalidades as IGato["personalidade"];
    }

    // Validação de Booleanos (Apenas garantindo o tipo)
    if (data.castrado !== undefined && typeof data.castrado !== "boolean") {
        throw new MissingParamsError("O campo 'castrado' deve ser um booleano (true ou false).");
    }
    if (data.vacinado !== undefined && typeof data.vacinado !== "boolean") {
        throw new MissingParamsError("O campo 'vacinado' deve ser um booleano (true ou false).");
    }
    if (data.vermifugado !== undefined && typeof data.vermifugado !== "boolean") {
        throw new MissingParamsError("O campo 'vermifugado' deve ser um booleano (true ou false).");
    }
    if (data.necessidadesEspeciais !== undefined && typeof data.necessidadesEspeciais !== "boolean") {
        throw new MissingParamsError("O campo 'necessidadesEspeciais' deve ser um booleano (true ou false).");
    }

    return data;
};