import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";


const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  jwt.verify(token, process.env.JWT_SECRET || "secret", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token." });
    }

   
    if (!decoded || typeof decoded === "string") {
      return res.status(401).json({ message: "Invalid token payload." });
    }

    
    req.user = { id: (decoded as JwtPayload & { id?: string }).id! };

    next();
  });
};

export default verifyJWT;