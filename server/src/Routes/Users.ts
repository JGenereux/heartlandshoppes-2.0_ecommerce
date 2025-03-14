import { Request, Response } from "express";
import express from 'express';
import { CartItem, User } from '../Interfaces/userInterface';
import { Bill, Order } from '../Interfaces/orderInterface';
import { Users } from "../Models/User";
import { client } from "../../redis-client";

const router = express.Router();

/**
 * Adds a user to the Users db
 * @param {User} user The user's information
 * @returns {Number} The status code indicating if the response was successful or not 
 */
router.post('/', async(req: Request,res: Response) : Promise<any> => {
    const {user} = req.body

    try{
        const newUser = new Users(user)
        await newUser.save()

        res.status(200).json('User successfully added')
    } catch(error) {
        res.status(500).json(`Internal Server Error: ${error}`)
    }
})

/**
 * Updates a single user's billing info
 * @param {String} email The user's email
 * @param {Bill} billingInfo The user's new billingInfo
 * @returns {Number} The status code indicating if the response was successful or not
 */
router.put('/:email/billing', async(req: Request,res: Response): Promise<any> => {
    const {email} = req.params
    const {bill} = req.body
    
    try{
        const updatedBill = await Users.findOneAndUpdate({email: email}, {bill: bill}, {new: true})
        
        if(!updatedBill) {
            return res.status(404).json('Error updating billing information')
        }

        res.status(200).json('Successfully updated billing information')
    } catch(error) {
        res.status(500).json(`Internal Server Error: ${error}`)
    }
})

/**
 * Retrieve a single user from the Users db
 * @param {String} email The user's email
 * @returns {User} The user's information 
 */
router.get('/:email', async(req: Request,res: Response): Promise<any> => {
    const {email} = req.params

    try{
        const user = await Users.findOne({email:email})
        
        if(!user) {
            return res.status(404).json('Error retrieving user from db')
        }

        return res.status(200).json(user)
    } catch(error) {
        res.status(500).json(`Internal Server Error: ${error}`)
    }
})

/**
 * Removes a single user from the Users db
 * @param {String} email The user's email
 * @returns {Number} The status code indicating success or error
 */
router.delete('/:email', async(req: Request,res: Response): Promise<any> => {
    const {email} = req.params

    try{
        const deletedUser = await Users.findOneAndDelete({email:email})

        if(!deletedUser) {
            return res.status(404).json('Error deleting user from database')
        }

        return res.status(200).json('Successfully deleted user from database')
    } catch(error) {
        res.status(500).json(`Internal Server Error: ${error}`)
    }
})

/**
 * Retrieves all the orders of a given User
 * @param {String} email The user's email
 * @returns {Order[]} An array of orders containg the orderHistory of the user
 */
router.get('/:email/orders', async(req: Request, res: Response): Promise<any> => {
    const {email} = req.params

    try{
        const user = await Users.findOne({email: email})
        if(!user) {
            return res.status(404).json('Error retrieving users information from db')
        }

        const orders = user?.orderHistory
        return res.status(200).json(orders)
    } catch(error) {
        res.status(500).json(`Internal Server Error: ${error}`)
    }
})

/**
 * Adds an order to a users order history
 * @param {String} email The user's email
 * @param {Order} order The order information 
 */
router.put('/:email/orders', async(req: Request,res: Response): Promise<any> => {
    const {email} = req.params
    const {order} = req.body

    try{
        const updatedOrders = await Users.findOneAndUpdate(
            { email: email },
            { $push: { orderHistory: order } },
            { new: true }
        );
        
        if(!updatedOrders) {
            return res.status(404).json('Error updating order history for user')
        }

        return res.status(200).json("Successfully updated order history")
    } catch(error) {
        res.status(500).json(`Internal Server Error: ${error}`)
    }
})


router.put('/cart/:email', async(req: Request,res: Response): Promise<any> => {
    
    const {email} = req.params
    const {cart} = req.body

    try{
        const user = await Users.findOneAndUpdate({email: email}, {cart: cart}, {new: true})
        
        if(!user) {
            return res.status(404).json("Error updating user. Check values sent")
        }

        return res.status(200).json("Successfully updated cart")
    } catch(error) {
        console.error(error)
        res.status(500).json(`Internal server error: ${error}`)
    }
})



export default router