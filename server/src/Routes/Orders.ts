import { Request, Response } from "express";
import express from 'express'
import { Order } from '../Interfaces/orderInterface'
import { Orders } from '../Models/Order'
import { client } from "../../redis-client";
import { authenticateToken, checkAdminRole } from "../Utils/authHelpers";

/**
 * UPDATE ORDERS TO HAVE ID STORED IN CACHE!
 */

const router = express.Router()

async function retrieveOrders(): Promise<any | null> {
    try{
    const ordersExist = await client.exists('orders');
    
        if (ordersExist === 1) {
            // Fetch all orders from the cache
            const cachedOrders = await client.sendCommand(['LRANGE', 'orders', '0', '-1']);
            const orders: Order[] = cachedOrders.map((order: string) => JSON.parse(order));

            return orders
        }

        return null
    } catch(error) {
        console.log(error)
        return null
    }
}

async function retrieveOrder(property: string, value: any): Promise<any | null> {
    // Check if orders exist in the cache
    try {
        const ordersExist = await client.exists('orders');

        if (ordersExist === 1) {
            // Fetch all orders from the cache
            const cachedOrders = await client.sendCommand(['LRANGE', 'orders', '0', '-1']);
            const orders: Order[] = cachedOrders.map((order: string) => JSON.parse(order));

            // Find the order that matches the given property and value
            const foundOrder = orders.find((order: Order) => (order as any)[property] === value);

            // Return the found order or null if not found
            return foundOrder || null;
        }

        const query = {
            [property]: value
        };

        const order = await Orders.findOne(query)

        return order || null;
    } catch (error) {
        console.log(`Error retrieving single order: ${error}`);
        return null;
    }
}

//queryProp is a string currently cause its only used for 'id
async function updateOrder(
    queryProp: keyof Order, 
    queryVal: any, 
    updatedProp: keyof Order, 
    updatedVal: Order[keyof Order] // Ensure correct type for updated value
): Promise<Order[] | null> {

    try {
        const ordersExist = await client.exists('orders');

        if (ordersExist === 1) {
            const cachedOrders = await client.sendCommand(['LRANGE', 'orders', '0', '-1']);
            const orders: Order[] = cachedOrders.map((order: string) => JSON.parse(order));

            const orderIndex = orders.findIndex((order: Order) => (order as any)[queryProp] == queryVal);

            if (orderIndex === -1) return null;

            // Use type assertion to safely access the property
            const order = orders[orderIndex];

            // Type assertion to ensure that `updatedProp` is valid for this order
            (order as any)[updatedProp] = updatedVal;

            await client.sendCommand(['DEL', 'orders']);
            await client.sendCommand(['RPUSH', 'orders', ...orders.map(order => JSON.stringify(order))]);
            await client.sendCommand(["EXPIRE", "orders", 1000])

            return orders;
        }

        return null;
    } catch (error) {
        console.log(`Error updating order: ${error}`);
        return null;
    }
}


async function removeOrder(queryProp: string, queryVal: any): Promise<boolean | null> {
    try {
        const ordersExist = await client.exists('orders');

        if (ordersExist === 1) {
            const cachedOrders = await client.sendCommand(['LRANGE', 'orders', '0', '-1']);
            const orders: Order[] = cachedOrders.map((order: string) => JSON.parse(order));

            // Find the index of the order
            const index = orders.findIndex((order: Order) => (order as any)[queryProp] === queryVal);

            // If no order is found, return false
            if (index === -1) return false;

            // Use splice to properly remove the order from the array
            orders.splice(index, 1);

            // Clear the cached orders in Redis and re-push the updated array
            await client.sendCommand(['DEL', 'orders']);
            await client.sendCommand(['RPUSH', 'orders', ...orders.map((order) => JSON.stringify(order))]);
            await client.sendCommand(["EXPIRE", "orders", 1000])

            return true;
        }

        return false;
    } catch (error) {
        console.log(`Error removing order: ${error}`);
        return null;
    }
}

/**
 * Retrieves all orders
 * @returns {Orders[]} An array containing all orders
 */
router.route('/').get(authenticateToken, checkAdminRole,  async(req: Request,res: Response) : Promise<any> => {
    try{
        // if orders are cached returns Order[], else null
        const cachedOrders = await retrieveOrders()
        if(cachedOrders != null) {
            return res.status(200).json(cachedOrders)
        }

        const orders = await Orders.find();
        const formattedOrders: Order[] = orders.map(order => ({
            orderId: order._id.toString(), // Convert ObjectId to string
            items: order.items,
            totalPrice: order.totalPrice,
            billingInfo: order.billingInfo,
            status: order.status,
            trackingNumber: order.trackingNumber,
            date: order.date
        }));
        
        
        if(!orders) {
            return res.status(404).json("Error fetching all orders from db")
        } else if(orders.length == 0) {
            return res.status(200).json([])
        }
        
        // Set orders list to fetched orders
        await client.sendCommand(["DEL", "orders"])
        await client.sendCommand(["LPUSH", "orders", ...formattedOrders.map((order: Order) => JSON.stringify(order))])

        await client.sendCommand(["EXPIRE", "orders", 1000])

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
router.route('/id/:id').get(authenticateToken, checkAdminRole, async(req: Request,res: Response) : Promise<any> => {
    const {id} = req.params
   
    try{
        const order = await retrieveOrder('orderId', id)
        if(order === null){
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
router.route('/').post(authenticateToken, checkAdminRole, async(req: Request,res: Response) : Promise<any> => {
    const {order} = req.body
    
    try{
        const newOrder = new Orders(order)
        newOrder.orderId = newOrder._id
        await newOrder.save()

        await client.sendCommand(["RPUSH", "orders", JSON.stringify(newOrder)])
        await client.sendCommand(["EXPIRE", "orders", 1000])

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
router.route('/:id/status').put(authenticateToken, checkAdminRole, async(req: Request,res: Response) : Promise<any> => {
    const {id} = req.params
    const {status} = req.body

    try{
        const orderUpdated = await Orders.findOneAndUpdate({orderId: id}, {status: status}, {new: true})
        
        if(!orderUpdated){
            return res.status(404).json("Error updating status for order")
        }

        //update cache
        const orderCacheUpdated = await updateOrder('orderId', id, 'status', status)
        if(orderCacheUpdated === null) {
            return res.status(404).json("Error updating cache for order")
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
router.route('/:id/trackingNumber').put(authenticateToken, checkAdminRole, async(req: Request,res: Response) : Promise<any> => {
    const {id} = req.params
    const {trackingNumber} = req.body

    try{
        const orderUpdated = await Orders.findOneAndUpdate({orderId: id}, {trackingNumber: trackingNumber}, {new: true})
        
        if(!orderUpdated){
            return res.status(404).json("Error updating tracking number for order")
        }

        //update cache
        const orderCacheUpdated = await updateOrder('orderId', id, 'trackingNumber', trackingNumber)
        if(orderCacheUpdated === null) {
            return res.status(404).json("Error updating cache for order")
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
router.route('/:id').delete(authenticateToken, checkAdminRole, async(req: Request,res: Response) : Promise<any> => {
    const {id} = req.params
   
    try{
        const orderDel = await Orders.findOneAndDelete({orderId: id})
        
        if(!orderDel) {
            return res.status(404).json("Error deleting order")
        }

        const orderRemoved = await removeOrder('orderId', id)
        
        if(!orderRemoved || orderRemoved === null) {
            return res.status(404).json("Error removing order from cache")
        } 

        return res.status(200).json("Successfully deleted order")
    } catch(error) {
        res.status(500).json(`Internal Server Error: ${error}`)
    }
})

export default router