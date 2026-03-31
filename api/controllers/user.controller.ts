import { Request, Response } from "express";
import { registerService, loginService } from "../services/user.service.js";
import { IUser } from "../models/User.js";


export const registerController = async (req: Request<any, any, IUser>, res: Response) => {

    const user = await registerService(req.body);
    return res.status(user.status).json({ message: user.message, user: user.data });
    
};

export const loginController = async (req: Request<any, any, IUser>, res: Response) => {
    
    const user = await loginService(req.body);
    return res.status(user.status).json({ message: user.message, user: user.data });
    
};