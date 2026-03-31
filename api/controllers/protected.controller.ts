import { Request, Response } from "express";

export const JWTController = async (req: Request, res: Response) => {
    return res.status(200).json({ message: "Protected route accessed successfully.", user: req.user });
}