import { Request, Response } from "express";
import express from 'express'
import { Order } from '../Interfaces/orderInterface'
import { Orders } from '../Models/Order'

const router = express.Router()

/**
 * Retrieves all orders
 * @returns {Orders[]} An array containing all orders
 */
router.get('/', async(req: Request,res: Response) : Promise<any> => {
    try{
        const orders = await Orders.find()
        
        if(!orders) {
            return res.status(404).json("Error fetching all orders from db")
        }

        return res.status(200).json(orders)
    } catch(error) {
        res.status(500).json(`Internal Server Error: ${error}`)
    }
})

/**
 * Retrieves a single order
 * @param {String} orderID The ID for the order
 * @returns {Order} The information for the order
 */
router.get('/:id', async(req: Request,res: Response) : Promise<any> => {
    const {id} = req.params
   
    try{
        const order = await Orders.findOne({_id: id})
        if(!order){
            return res.status(404).json("Error fetching order from db")
        }

        return res.status(200).json(order)
    } catch(error) {
        res.status(500).json(`Internal Server Error: ${error}`)
    }
})

/**
 * Adds a order
 * @param {Order} order The information for the order
 * @returns {Number} The status code indicating if the req was successful or not
 */
router.post('/', async(req: Request,res: Response) : Promise<any> => {
    const {order} = req.body
    
    try{
        const newOrder = new Orders(order)
        await newOrder.save()

        return res.status(200).json("Order successfully added")
    } catch(error) {
        res.status(500).json(`Internal Server Error: ${error}`)
    }
})

/**
 * Updates the status of an order
 * @param {String} id The ID for the order
 * @param {Boolean} status If status true, order is still on-going else order is fulfilled
 * @returns {Number} The status code indicating if the req was successful or not
 */
router.put('/:id/status', async(req: Request,res: Response) : Promise<any> => {
    const {id} = req.params
    const {status} = req.body
    console.log(id)
    try{
        const orderUpdated = await Orders.findOneAndUpdate({_id: id}, {status: status}, {new: true})
        
        if(!orderUpdated){
            return res.status(404).json("Error updating status for order")
        }

        return res.status(200).json("Order status successfully updated")
    } catch(error) {
        res.status(500).json(`Internal Server Error: ${error}`)
    }
})

/**
 * Updates the tracking number of an order
 * @param {String} id The ID for the order
 * @param {trackingNumber} trackingNum The tracking number for an order
 * @returns {Number} The status code indicating if the req was successful or not
 */
router.put('/:id/trackingNumber', async(req: Request,res: Response) : Promise<any> => {
    const {id} = req.params
    const {trackingNumber} = req.body

    try{
        const orderUpdated = await Orders.findOneAndUpdate({_id: id}, {trackingNumber: trackingNumber}, {new: true})
        
        if(!orderUpdated){
            return res.status(404).json("Error updating tracking number for order")
        }

        return res.status(200).json("Tracking number for order successfully updated")
    } catch(error) {
        res.status(500).json(`Internal Server Error: ${error}`)
    }
})

/**
 * Removes an order from the Order db 
 * @param {String} orderID The ID for the order
 * @returns {Number} The status code indicating if the req was successful or not
 */
router.delete('/:id', async(req: Request,res: Response) : Promise<any> => {
    const {id} = req.params

    try{
        const orderDel = await Orders.findOneAndDelete({_id: id})
        if(!orderDel) {
            return res.status(404).json("Error deleting order")
        }

        res.status(200).json("Successfully deleted order")
    } catch(error) {
        res.status(500).json(`Internal Server Error: ${error}`)
    }
})

export default router