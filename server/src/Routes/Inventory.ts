import express from 'express';

const router = express.Router();


/**
 * Retrieves all items 
 * @returns {Item[]} An array of all the items 
 */
router.get('/', async(req,res) => {

})

/**
 * Retrieves all items belonging to a given category
 * @param {String} category The name of the category
 * @returns {Item[]} An array of the items belonging to the category 
 */
router.get('/:category', async(req,res) => {

})

/**
 * Retrieves a single item
 * @param {String} itemName The name of the item
 * @returns {Item} The info for the item
 */
router.get('/item/:name', async(req, res) => {

})

/**
 * Adds a item
 * @param {Item} item The information of the item
 * @returns {Number} The status code indicating whether request was successful or not
 */
router.post('/item', async(req,res) => {

})

/**
 * Updates an item
 * @param {String} itemName The name of the item to update
 * @param {Item} newItem The updated information for the requested item
 * @returns {Number} The status code indicating whether request was successful or not
 */
router.put('/item/:name', async(req, res) => {

})

/**
 * Removes an item
 * @param {String} itemName The name of the item to remove
 * @returns {Number} The status code indicating whether request was successful or not
 */
router.delete('/item/:name', async(req,res) => {

})

export default router