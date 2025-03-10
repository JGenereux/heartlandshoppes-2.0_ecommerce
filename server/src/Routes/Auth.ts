import express from 'express';
import { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { generateAccessToken } from '../Utils/authHelpers';
import { Users } from '../Models/User';
import { Token } from '../Models/RefreshToken';
import * as bcrypt from 'bcryptjs';

const router = express.Router()

async function getTokens(userEmail: string, userRole: string) {
    const accessToken = generateAccessToken(userEmail, userRole)

    const secret = process.env.REFRESH_TOKEN_SECRET
    if(!secret) {
        throw new Error("Internal server error while generating refresh token")
    }
    const refreshToken = jwt.sign({email: userEmail, role: userRole}, secret, {expiresIn: '72h'})

    // if user has a refreshToken replace it with the new one
    const hasToken = await Token.findOne({email: userEmail})
    if(hasToken) {
        hasToken.refreshToken = refreshToken
        await hasToken.save() 
    } else {
        const newToken = new Token({email: userEmail, refreshToken})
        await newToken.save() 
    }
    
    return {accessToken: accessToken, refreshToken: refreshToken}
}

router.route('/login').post(async(req: Request, res: Response) : Promise<any> => {
    const {userEmail, password} = req.body

    try{
        const user = await Users.findOne({email: userEmail})
        
        if(!user) {
            return res.status(400).json("User with this email doesn't exist")
        }

        //check if given password is the same as hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password)

        if(!isPasswordValid) {
            return res.status(401).json("User credentials invalid")
        }

        // create access and refresh token
        const {accessToken, refreshToken} = await getTokens(user.email, user.role)

        // store refreshToken as httpOnly to prevent JS access
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true, // Prevents access via JavaScript
            secure: process.env.NODE_ENV === 'production', // Only send cookie over HTTPS in production
            maxAge: 72 * 60 * 60 * 1000, // Cookie expires after 72 hours
            sameSite: 'strict', // Helps mitigate CSRF attacks
        });

        const {email, orderHistory, billingInfo} = user
        const currUser = {email: email, orderHistory: orderHistory, billingInfo: billingInfo}
     
        return res.status(200).json({user: currUser, accessToken: accessToken})
    } catch(error) {
        res.status(500).json(`Internal server error ${error}`)
    }
})

router.route('/signup').post(async(req: Request, res: Response) : Promise<any> => {
    const {userEmail, password, userRole} = req.body

    try{
        //check if user already exists
        const userExist = await Users.findOne({email: userEmail})

        if(userExist) {
            return res.status(409).json("User with this email already exists!")
        }

        // create hashedPassword
        const hashedPassword = await bcrypt.hash(password, 10)
        if (!hashedPassword) {
            return res.status(500).json("Server error while hashing the password.");
        }

        const newUser = new Users({email: userEmail, password: hashedPassword, role: userRole})
        await newUser.save()

        // create access and refresh token
        const {accessToken, refreshToken} = await getTokens(userEmail, userRole)

        // store refreshToken as httpOnly to prevent JS access
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true, // Prevents access via JavaScript
            secure: process.env.NODE_ENV === 'production', // Only send cookie over HTTPS in production
            maxAge: 72 * 60 * 60 * 1000, // Cookie expires after 72 hours
            sameSite: 'strict', // Helps mitigate CSRF attacks
        });

        const {email, orderHistory, billingInfo} = newUser
        const currUser = {email: email, orderHistory: orderHistory, billingInfo: billingInfo}
        
        console.log('Sending account info')
        return res.status(200).json({user: currUser, accessToken: accessToken})
    } catch(error) {
        res.status(500).json(`Internal server error ${error}`)
    }
})

router.route('/token').post(async(req: Request, res: Response) : Promise<any> => {
    const {refreshToken} = req.body
    
    if(refreshToken == null) return res.status(403)

    const secret = process.env.REFRESH_TOKEN_SECRET;

    if (!secret) {
        console.error("REFRESH_TOKEN_SECRET is not defined");
        return res.status(500).json({ message: "Internal server error" });
    }
    jwt.verify(refreshToken, secret, (err: any, user: any) => {
        if(err) return res.status(403)
        const accessToken = generateAccessToken(user.email, user.role)
        res.status(200).json({accessToken: accessToken})
    })
})

export default router