import express from 'express';
import { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { generateAccessToken } from '../Utils/authHelpers';

const router = express.Router()


router.route('/token').post(async(req: Request, res: Response) : Promise<any> => {
    const {refreshToken, email} = req.body
    
    if(refreshToken == null) return res.status(403)

    const secret = process.env.REFRESH_TOKEN_SECRET;

    if (!secret) {
        console.error("REFRESH_TOKEN_SECRET is not defined");
        return res.status(500).json({ message: "Internal server error" });
    }
    jwt.verify(refreshToken, secret, (err: any, user: any) => {
        if(err) return res.status(403)
        const accessToken = generateAccessToken({email: email})
        res.status(200).json({accessToken: accessToken})
    })
})
