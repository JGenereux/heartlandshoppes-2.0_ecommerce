import { Request, Response } from "express";
import express from 'express';
import { User } from '../Interfaces/userInterface';
import { Bill, Order } from '../Interfaces/orderInterface';

const router = express.Router();

/**
 * Adds a user to the Users db
 * @param {User} user The user's information
 * @returns {Number} The status code indicating if the response was successful or not 
 */
router.post('/', async(req: Request,res: Response) => {
})

/**
 * Updates a single user's billing info
 * @param {String} email The user's email
 * @param {Bill} billingInfo The user's new billingInfo
 * @returns {Number} The status code indicating if the response was successful or not
 */
router.put('/:email/billing', async(req: Request,res: Response) => {
    
})

/**
 * Retrieve a single user from the Users db
 * @param {String} email The user's email
 * @returns {User} The user's information 
 */
router.get('/:email', async(req: Request,res: Response) => {
})

/**
 * Removes a single user from the Users db
 * @param {String} email The user's email
 * @returns {Number} The status code indicating success or error
 */
router.delete('/:email', async(req: Request,res: Response) => {
})

/**
 * Adds an order to a users order history
 * @param {String} email The user's email
 * @param {Order} order The order information 
 */
router.put('/:email/orders', async(req: Request,res: Response) => {
})




export default router