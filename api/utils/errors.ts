export class MissingParamsError extends Error {

    constructor(message: string) {
        super(message);
        this.name = "MissingParamsError";
    }
}

export class UnauthorizedError extends Error {

    constructor(message: string) {
        super(message);
        this.name = "UnauthorizedError";
    }
}

export class InvalidIdError extends Error {

    constructor(message: string) {
        super(message);
        this.name = "InvalidIdError";
    }
}

export class InvalidEnumError extends Error {
    
    constructor(message: string) {
        super(message);
        this.name = "InvalidEnumError";
    }
}