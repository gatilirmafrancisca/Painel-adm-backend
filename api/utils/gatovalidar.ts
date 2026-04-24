import { IGato } from "../models/Gato.js";
import * as CatTypes from "../types/cats.types.js";
import { MissingParamsError, InvalidEnumError } from "./errors.js";

const hasOwnField = (obj: Record<string, any>, key: string): boolean => Object.prototype.hasOwnProperty.call(obj, key);
const isEmptyValue = (value: unknown): boolean => value === undefined || value === null || value === "";

const validateStringField = (value: unknown, fieldLabel: string): string => {
    const normalized = String(value ?? "").trim();
    if (!normalized) {
        throw new MissingParamsError(`O campo '${fieldLabel}' não pode estar vazio.`);
    }
    return normalized;
};

const validateIntegerField = (value: unknown, fieldLabel: string): number => {
    if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
        throw new MissingParamsError(`O campo '${fieldLabel}' deve ser um número inteiro válido.`);
    }
    return value;
};

const validateBooleanField = (value: unknown, fieldLabel: string): boolean => {
    if (typeof value !== "boolean") {
        throw new MissingParamsError(`O campo '${fieldLabel}' deve ser um booleano (true ou false).`);
    }
    return value;
};

const validateEnumField = <T extends readonly string[]>(
    value: unknown,
    fieldLabel: string,
    allowedValues: T,
): T[number] => {
    const normalized = validateStringField(value, fieldLabel);
    if (!allowedValues.includes(normalized)) {
        throw new InvalidEnumError(`${fieldLabel} inválido '${normalized}'. Valores permitidos: ${allowedValues.join(", ")}.`);
    }
    return normalized as T[number];
};

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
    const normalizedData: Partial<IGato> & Record<string, any> = { ...data };

    if (hasOwnField(rawData, "idade")) {
        const idadeConvertida = parseNumberFormValue(rawData.idade);
        normalizedData.idade = idadeConvertida !== undefined || isMissingRawValue(rawData.idade)
            ? idadeConvertida
            : rawData.idade;
    }

    if (hasOwnField(rawData, "castrado")) {
        const castradoConvertido = parseBooleanFormValue(rawData.castrado);
        normalizedData.castrado = castradoConvertido !== undefined || isMissingRawValue(rawData.castrado)
            ? castradoConvertido
            : rawData.castrado;
    }

    if (hasOwnField(rawData, "vacinado")) {
        const vacinadoConvertido = parseBooleanFormValue(rawData.vacinado);
        normalizedData.vacinado = vacinadoConvertido !== undefined || isMissingRawValue(rawData.vacinado)
            ? vacinadoConvertido
            : rawData.vacinado;
    }

    if (hasOwnField(rawData, "vermifugado")) {
        const vermifugadoConvertido = parseBooleanFormValue(rawData.vermifugado);
        normalizedData.vermifugado = vermifugadoConvertido !== undefined || isMissingRawValue(rawData.vermifugado)
            ? vermifugadoConvertido
            : rawData.vermifugado;
    }

    if (hasOwnField(rawData, "necessidadesEspeciais")) {
        const necessidadesConvertido = parseBooleanFormValue(rawData.necessidadesEspeciais);
        normalizedData.necessidadesEspeciais = necessidadesConvertido !== undefined || isMissingRawValue(rawData.necessidadesEspeciais)
            ? necessidadesConvertido
            : rawData.necessidadesEspeciais;
    }

    if (hasOwnField(rawData, "personalidade")) {
        normalizedData.personalidade = normalizarPersonalidades(rawData.personalidade);
    }

    return normalizedData;
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
    validateEnumField(data.sexo, "Sexo", CatTypes.SEXOTYPES);
    validateEnumField(data.cor, "Cor", CatTypes.CORTYPES);
    validateEnumField(data.fivFelv, "FIV/FeLV", CatTypes.FIVFELVTYPES);
    validateEnumField(data.status, "Status", CatTypes.STATUSTYPES);

    const personalidadesInvalidas = (data.personalidade || []).filter(p => !CatTypes.PERSONALIDADETYPES.includes(p as CatTypes.PersonalidadeType));
    if (personalidadesInvalidas.length > 0) {
        throw new InvalidEnumError(`Personalidade(s) inválida(s): ${personalidadesInvalidas.join(", ")}. Valores permitidos: ${CatTypes.PERSONALIDADETYPES.join(", ")}.`);
    }

    validateIntegerField(data.idade, "idade");
    validateBooleanField(data.castrado, "castrado");
    validateBooleanField(data.vacinado, "vacinado");
    validateBooleanField(data.vermifugado, "vermifugado");
    validateBooleanField(data.necessidadesEspeciais, "necessidadesEspeciais");
};

const ALLOWED_PATCH_FIELDS = new Set([
    "nome",
    "idade",
    "sexo",
    "cor",
    "castrado",
    "vacinado",
    "vermifugado",
    "fivFelv",
    "personalidade",
    "necessidadesEspeciais",
    "descricaoBio",
    "status",
    "imagemUrl",
]);

export const validatePatchParams = async (data: Partial<IGato>): Promise<Partial<IGato>> => {
    const payload = data as Record<string, any>;
    const keys = Object.keys(payload);

    if (keys.length === 0) {
        throw new MissingParamsError("Nenhum dado foi fornecido para atualização.");
    }

    for (const key of keys) {
        if (!ALLOWED_PATCH_FIELDS.has(key)) {
            throw new MissingParamsError(`O campo '${key}' não é permitido na atualização.`);
        }
    }

    if (hasOwnField(payload, "nome")) {
        payload.nome = validateStringField(payload.nome, "nome");
    }

    if (hasOwnField(payload, "descricaoBio")) {
        payload.descricaoBio = validateStringField(payload.descricaoBio, "descricaoBio");
    }

    if (hasOwnField(payload, "imagemUrl")) {
        payload.imagemUrl = validateStringField(payload.imagemUrl, "imagemUrl");
    }

    if (hasOwnField(payload, "idade")) {
        payload.idade = validateIntegerField(payload.idade, "idade");
    }

    if (hasOwnField(payload, "castrado")) {
        payload.castrado = validateBooleanField(payload.castrado, "castrado");
    }

    if (hasOwnField(payload, "vacinado")) {
        payload.vacinado = validateBooleanField(payload.vacinado, "vacinado");
    }

    if (hasOwnField(payload, "vermifugado")) {
        payload.vermifugado = validateBooleanField(payload.vermifugado, "vermifugado");
    }

    if (hasOwnField(payload, "necessidadesEspeciais")) {
        payload.necessidadesEspeciais = validateBooleanField(payload.necessidadesEspeciais, "necessidadesEspeciais");
    }

    if (hasOwnField(payload, "sexo")) {
        payload.sexo = validateEnumField(payload.sexo, "Sexo", CatTypes.SEXOTYPES);
    }

    if (hasOwnField(payload, "cor")) {
        payload.cor = validateEnumField(payload.cor, "Cor", CatTypes.CORTYPES);
    }

    if (hasOwnField(payload, "fivFelv")) {
        payload.fivFelv = validateEnumField(payload.fivFelv, "FIV/FeLV", CatTypes.FIVFELVTYPES);
    }

    if (hasOwnField(payload, "status")) {
        payload.status = validateEnumField(payload.status, "Status", CatTypes.STATUSTYPES);
    }

    if (hasOwnField(payload, "personalidade")) {
        const personalidades = normalizarPersonalidades(payload.personalidade);

        if (personalidades.length === 0) {
            throw new MissingParamsError("O campo 'personalidade' não pode estar vazio.");
        }

        const personalidadesInvalidas = personalidades.filter((p) => !CatTypes.PERSONALIDADETYPES.includes(p as CatTypes.PersonalidadeType));
        if (personalidadesInvalidas.length > 0) {
            throw new InvalidEnumError(`Personalidade(s) inválida(s): ${personalidadesInvalidas.join(", ")}. Valores permitidos: ${CatTypes.PERSONALIDADETYPES.join(", ")}.`);
        }

        payload.personalidade = personalidades;
    }

    return payload as Partial<IGato>;
};
