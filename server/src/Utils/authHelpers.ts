import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';

function generateAccessToken(userEmail: any, userRole: any) {
    const secret = process.env.ACCESS_TOKEN_SECRET

    if(!secret) {
        return null
    }

    return jwt.sign({email: userEmail, role: userRole}, secret, {expiresIn: '1h'})
}


interface AuthRequest extends Request {
    user?: any; // Extend Request to include user
}

interface JWTUser {
    email: string,
    role: string
}
/**
 * Middleware function that checks if user has valid jwt token
 */
function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];

    const token = (typeof authHeader === 'string') ? authHeader.split(" ")[1] : null;

    if (!token) {
        return res.status(401).json({ message: "Authentication required" });
    }

    const secret = process.env.ACCESS_TOKEN_SECRET;

    if (!secret) {
        console.error("ACCESS_TOKEN_SECRET is not defined");
        return res.status(500).json({ message: "Internal server error" });
    }

    jwt.verify(token, secret, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Access token invalid" });
        }

        req.user = user; // Attach user data to request
        next();
    });
}

interface AuthRoleRequest extends Request {
    user?: JWTUser; // Extend Request to include user
}
/**
 * Middleware functions for checking roles
 */
function checkAdminRole(req: AuthRoleRequest, res: Response, next: NextFunction) {
    const user = req.user

    if(!user) return res.status(404).json("Role is not valid")

    if (user.role !== 'admin') {
        return res.status(403).json({ message: "You do not have permission to access this resource" });
    }

    next();
}

function checkUserRole(req: AuthRoleRequest, res: Response, next: NextFunction) {
    const user = req.user

    if(!user) return res.status(404).json("Role is not valid")

    if (user.role !== 'user') {
        return res.status(403).json({ message: "You do not have permission to access this resource" });
    }

    next();
}

export {authenticateToken, generateAccessToken}