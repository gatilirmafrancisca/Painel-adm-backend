import { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {

    if (err.name === "MissingParamsError") {
        return res.status(400).json({ message: err.message });
    }

    if (err.name === "InvalidEnumError") {
        return res.status(400).json({ message: err.message });
    }

    if (err.name === "InvalidIdError") {
        return res.status(400).json({ message: err.message });
    }

    if (err.name === "UnauthorizedError") {
        return res.status(401).json({ message: err.message });
    }

    console.error("Error:", err);
    res.status(500).json({ message: "Internal Server Error." });



}