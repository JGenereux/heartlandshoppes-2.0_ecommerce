import express from 'express';
import { sendInquiryMessage } from '../Utils/Emails';
import { Request, Response } from "express";
const router = express.Router()

interface Message {
    name: string,
    email: string,
    message: string
}

router.post('/inquire', async(req: Request, res: Response): Promise<any> => {
    const {userInquiry} = req.body
    const {name, email, message} = userInquiry
    try{
        sendInquiryMessage({email: email, fullName: name, text: message})
        return res.status(200).json("Successfully sent message")
    } catch(error) {
        return res.status(500).json(`Internal server error sending inquiry email: ${error}`)
    }
})
export default router 