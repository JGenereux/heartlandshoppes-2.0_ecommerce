import { Request, Response } from "express";
import express from 'express';
import {Items}from '../Models/Item';
import {Item} from '../Interfaces/itemInterface';

const router = express.Router();


/**
 * Retrieves all items 
 * @returns {Item[]} An array of all the items 
 */
router.get('/', async(req: Request,res: Response) => {
    try{
        const items: Item[] = await Items.find()

        if(!items) {
            res.status(417).json("Error retrieving items from db")
            return
        }

        res.status(200).json(items)
        return
    } catch(error) {
        res.status(500).json("Internal server error")
    }
})

/**
 * Retrieves all items belonging to a given category
 * @param {String} category The name of the category
 * @returns {Item[]} An array of the items belonging to the category 
 */
router.get('/:category', async(req: Request,res: Response) => {
    const {category} = req.params
    try{
        const items: Item[] = await Items.find({category: {$in: [category]}})
    
        if(!items) {
            res.status(417).json("Error fetching items from db")
            return
        }

        res.status(200).json(items)
        return
    } catch(error) {
        res.status(500).json("Internal server error")
    }
})

/**
 * Retrieves a single item
 * @param {String} itemName The name of the item
 * @returns {Item} The info for the item
 */
router.get('/item/:name', async(req: Request,res: Response) => {
    const {name} = req.params
    console.log(name)
    console.log('merp')
    try{
        console.log('merp')
        const item: Item | null = await Items.findOne({name: name})

        if(!item) {
            res.status(417).json("Error retrieving item from db")
            return
        }

        res.status(200).json(item)
        return
    } catch(error) {
        res.status(500).json("Internal server error")
    }
})

/**
 * Adds a item
 * @param {Item} item The information of the item
 * @returns {Number} The status code indicating whether request was successful or not
 */
router.post('/item', async(req,res) => {
   
    try{
        const newItem = new Items(req.body)
        await newItem.save()
        res.status(200).json("Successfully added item")
        return
    } catch(error) {
        res.status(500).json("Internal server error")
    }
})

/**
 * Updates an item
 * @param {String} itemName The name of the item to update
 * @param {Item} newItem The updated information for the requested item
 * @returns {Number} The status code indicating whether request was successful or not
 */
router.put('/item/:name', async(req: Request,res: Response) => {
    const {name} = req.params
    const {item} = req.body

    try{
        const updated = await Items.findOneAndUpdate(
            { name: name }, 
            { $set: item },  
            { new: true, runValidators: true } 
        );

        if(!updated) {
            res.status(404).json("Item not found")
            return
        }

        res.status(200).json("Item was successfully updated")
        return
    } catch(error) {
        res.status(500).json("Internal server error")
    }
})

/**
 * Removes an item
 * @param {String} itemName The name of the item to remove
 * @returns {Number} The status code indicating whether request was successful or not
 */
router.delete('/item/:name', async(req,res) => {
    const {name} = req.params
    try{
        const removed = await Items.findOneAndDelete({name: name}) 
        if(!removed) {
            res.status(404).json("Item wasn't found")
            return
        }

        res.status(200).json("Item successfully deleted")
        return
    } catch(error) {
        res.status(500).json("Internal server error")
    }
})

export default router