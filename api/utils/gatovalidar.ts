import { IGato } from "../models/Gato.js";
import * as CatTypes from "../types/cats.types.js";
import { MissingParamsError, InvalidEnumError } from "./errors.js";

// Função para garantir que a personalidade seja sempre um array de strings limpas
export const normalizarPersonalidades = (personalidade: any): CatTypes.PersonalidadeType[] => {
    let arr: string[];

    if (Array.isArray(personalidade)) {
        arr = personalidade.map((p) => String(p).trim());
    } else {
        const raw = String(personalidade || "").trim();

        if (raw.startsWith("[") && raw.endsWith("]")) {
            try {
                const parsed = JSON.parse(raw);
                arr = Array.isArray(parsed)
                    ? parsed.map((p) => String(p).trim())
                    : [raw];
            } catch {
                arr = raw.split(",").map((p) => p.trim());
            }
        } else if (raw.includes(",")) {
            arr = raw.split(",").map((p) => p.trim());
        } else {
            arr = [raw];
        }
    }

    arr = arr.filter((p) => p.length > 0);
    return arr as CatTypes.PersonalidadeType[];
};

const parseBooleanFormValue = (value: any): boolean | undefined => {
    if (typeof value === "boolean") return value;
    if (typeof value !== "string") return undefined;

    const normalized = value.trim().toLowerCase();

    if (["true", "1", "sim"].includes(normalized)) return true;
    if (["false", "0", "nao", "não"].includes(normalized)) return false;

    return undefined;
};

const parseNumberFormValue = (value: any): number | undefined => {
    if (typeof value === "number") return value;
    if (typeof value !== "string") return undefined;

    const normalized = value.trim();
    if (normalized === "") return undefined;

    const parsed = Number(normalized);
    return Number.isNaN(parsed) ? undefined : parsed;
};

export const normalizarDadosGato = (data: Partial<IGato> & Record<string, any>): Partial<IGato> => {
    const rawData = data as Record<string, any>;
    const isMissingRawValue = (value: any): boolean => value === undefined || value === null || value === "";

    const idadeConvertida = parseNumberFormValue(rawData.idade);
    const castradoConvertido = parseBooleanFormValue(rawData.castrado);
    const vacinadoConvertido = parseBooleanFormValue(rawData.vacinado);
    const vermifugadoConvertido = parseBooleanFormValue(rawData.vermifugado);
    const necessidadesConvertido = parseBooleanFormValue(rawData.necessidadesEspeciais);

    return {
        ...data,
        idade: idadeConvertida !== undefined || isMissingRawValue(rawData.idade)
            ? idadeConvertida
            : rawData.idade,
        castrado: castradoConvertido !== undefined || isMissingRawValue(rawData.castrado)
            ? castradoConvertido
            : rawData.castrado,
        vacinado: vacinadoConvertido !== undefined || isMissingRawValue(rawData.vacinado)
            ? vacinadoConvertido
            : rawData.vacinado,
        vermifugado: vermifugadoConvertido !== undefined || isMissingRawValue(rawData.vermifugado)
            ? vermifugadoConvertido
            : rawData.vermifugado,
        necessidadesEspeciais: necessidadesConvertido !== undefined || isMissingRawValue(rawData.necessidadesEspeciais)
            ? necessidadesConvertido
            : rawData.necessidadesEspeciais,
        personalidade: normalizarPersonalidades(data.personalidade),
    };
};

const isEmptyValue = (value: unknown): boolean => value === undefined || value === null || value === "";

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
    if (!String(data.nome || "").trim()) camposAusentes.push("Nome");
    if (!String(data.sexo || "").trim()) camposAusentes.push("Sexo");
    if (!String(data.cor || "").trim()) camposAusentes.push("Cor");
    if (!String(data.fivFelv || "").trim()) camposAusentes.push("FIV/FeLV");
    if (!String(data.status || "").trim()) camposAusentes.push("Status");
    if (!String(data.descricaoBio || "").trim()) camposAusentes.push("Descrição Bio");
    if (!data.personalidade || data.personalidade.length === 0) camposAusentes.push("Personalidade");
    if (isEmptyValue(data.idade)) camposAusentes.push("Idade");
    if (isEmptyValue(data.castrado)) camposAusentes.push("Castrado");
    if (isEmptyValue(data.vacinado)) camposAusentes.push("Vacinado");
    if (isEmptyValue(data.vermifugado)) camposAusentes.push("Vermifugado");
    if (isEmptyValue(data.necessidadesEspeciais)) camposAusentes.push("Necessidades Especiais");

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

        // Validação de Número
    if (data.idade !== undefined) {
        if (typeof data.idade !== 'number' || !Number.isInteger(data.idade) || data.idade < 0) {
            throw new MissingParamsError("A idade deve ser um número válido.");
        }
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
};
