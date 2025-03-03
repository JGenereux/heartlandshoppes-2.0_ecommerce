import express from 'express'
import { Order } from '../Interfaces/orderInterface'

const router = express.Router()

/**
 * Retrieves a single order
 * @param {String} orderID The ID for the order
 * @returns {Order} The information for the order
 */
router.get('/:orderID', async(req,res) => {

})

/**
 * Adds a order
 * @param {Order} order The information for the order
 * @returns {Number} The status code indicating if the req was successful or not
 */
router.post('/', async(req,res) => {

})

/**
 * Updates the status of an order
 * @param {String} orderID The ID for the order
 * @param {Boolean} status If status true, order is still on-going else order is fulfilled
 * @returns {Number} The status code indicating if the req was successful or not
 */
router.put('/:orderID/:status', async(req,res) => {

})

/**
 * Updates the tracking number of an order
 * @param {String} orderID The ID for the order
 * @param {trackingNumber} trackingNum The tracking number for an order
 * @returns {Number} The status code indicating if the req was successful or not
 */
router.put('/:orderID/:trackingNumber', async(req,res) => {

})

/**
 * Removes an order from the Order db 
 * @param {String} orderID The ID for the order
 * @returns {Number} The status code indicating if the req was successful or not
 */
router.delete('/:orderID', async(req,res) => {

})

export default router