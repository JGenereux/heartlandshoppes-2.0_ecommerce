import { Request, Response } from "express";
import express from 'express';
import {Items}from '../Models/Item';
import {Item} from '../Interfaces/itemInterface';
import { client } from "../../redis-client";
import { Orders } from "../Models/Order";
import { authenticateToken, checkAdminRole } from "../Utils/authHelpers";
import { rateLimiter } from "../Utils/rateLimiter";

const router = express.Router();

/**
 * Retrieves all items 
 * @returns {Item[]} An array of all the items 
 */
router.route('/').get(rateLimiter, async(req: Request,res: Response) => {
    try{
        const exists = await client.exists('items')
        
        if(exists === 1) {
            const cachedItems = await client.sendCommand(['LRANGE', 'items', '0', '-1'])
            const items: Item[] = cachedItems.map((item: any) => JSON.parse(item))
            res.status(200).json(items)
            return
        }

        const items: Item[] = await Items.find()

        if(!items) {
            res.status(417).json("Error retrieving items from db")
            return
        }
        
        
        await client.sendCommand(['DEL', 'items']); // Clear old list
        if(items.length > 0) {
            await client.sendCommand(['RPUSH', 'items', ...items.map(item => JSON.stringify(item))]); // Push all to Redis
        }
        res.status(200).json(items)
        return
    } catch(error) {
        res.status(500).json(`Internal server error ${error}`)
    }
})

/**
 * Retrieves all items belonging to a given category
 * @param {String} category The name of the category
 * @returns {Item[]} An array of the items belonging to the category 
 */
router.route('/:category').get(async(req: Request,res: Response) : Promise<any> => {
    const {category} = req.params
    try{
        // check if a cache exists for the category being queried already
        const categoryExist = await client.exists(`${category}`)

        if(categoryExist === 1) {
            const cachedItems = await client.sendCommand(['LRANGE', `${category}`, '0', '-1'])
            const items: Item[] = cachedItems.map((item: any) => JSON.parse(item))
            return res.status(200).json(items) 
        } 

        // since category doesn't exist check if the items cache exists
        const itemsExist = await client.exists('items')
        if(itemsExist === 1) {
            const cachedItems = await client.sendCommand(['LRANGE', `items`, '0', '-1'])
            const items: Item[] = cachedItems.map((item: any) => JSON.parse(item)).filter((item: Item) => item.category.includes(category))
            if(items.length == 0 ){
                return res.status(200).json([])
            }
            await client.sendCommand(["RPUSH", `${category}`, ...items.map(item => JSON.stringify(item))])
            return res.status(200).json(items)
        }

        // else query db and set in both caches
        const items: Item[] = await Items.find()

        if(!items) {
            return res.status(417).json("Error fetching items from db")
        }

        const filteredItems: Item[] = items.filter((item: Item) => item.category.includes(category))

        if(items.length > 0) {
            await client.sendCommand(["DEL", `items`])
            await client.sendCommand(["RPUSH", `items`, ...items.map(item => JSON.stringify(item))])
        }
        
        if(filteredItems.length > 0) {
            await client.sendCommand(["DEL", `${category}`])
            await client.sendCommand(["RPUSH", `${category}`, ...filteredItems.map(item => JSON.stringify(item))])
        }

        return res.status(200).json(items)
    } catch(error) {
        res.status(500).json("Internal server error")
    }
})

/**
 * Retrieves a single item
 * @param {String} itemName The name of the item
 * @returns {Item} The info for the item
 */
router.route('/item/:name').get(async(req: Request,res: Response): Promise<any> => {
    const {name} = req.params
  
    try{
        const itemsExist = await client.exists('items')
        if(itemsExist === 1) {
            const cachedItems = await client.sendCommand(['LRANGE', `items`, '0', '-1'])
            const items: Item[] = cachedItems.map((item: any) => JSON.parse(item))

            const item = items.find((item: Item) => item.name === name)
            return res.status(200).json(item)
        }

        const item: Item | null = await Items.findOne({name: name})

        if(!item) {
            return res.status(417).json("Error retrieving item from db")
        }

        return res.status(200).json(item)
    } catch(error) {
        res.status(500).json("Internal server error")
    }
})

/**
 * Adds a item
 * @param {Item} item The information of the item
 * @returns {Number} The status code indicating whether request was successful or not
 */
// add authenticateToken, checkAdminRole when auth ui is implemented
router.route('/item').post(async(req,res) : Promise<any> => {
    const {item} = req.body

    try{
        const newItem = new Items(item)
        await newItem.save()

        //add new item to items cache and category caches that the item belongs too
        await client.sendCommand(['LPUSH','items', JSON.stringify(newItem)])
     
        for(const category of newItem.category) {
            await client.sendCommand(['LPUSH', `${category}`, JSON.stringify(newItem)])
        }
      
        return res.status(200).json("Successfully added item")
    } catch(error) {
        console.error(error)
        res.status(500).json(`Internal server error: ${error} `)
    }
})

/**
 * Updates an item
 * @param {String} itemName The name of the item to update
 * @param {Item} newItem The updated information for the requested item
 * @returns {Number} The status code indicating whether request was successful or not
 */
router.route('/item/:name').put(async(req: Request,res: Response) : Promise<any> => {
    const {name} = req.params
    const {item, oldCategories} = req.body
    
    try{
        const updated = await Items.findOneAndUpdate(
            { name: name }, 
            { $set: item },  
            { new: true, runValidators: true } 
        );

        if(!updated) {
            return res.status(404).json("Item not found")
        }

        const itemsExists = await client.exists('items')

        if(itemsExists === 1) {
            const cachedItems = await client.sendCommand(['LRANGE', `items`, '0', '-1'])
            //remove item from items list
            const items: Item[] = cachedItems.map((item: any) => JSON.parse(item))
            //add new updated item to list
            //get index of item to update so it can be done in-place
            const index = items.findIndex((item: Item) => item.name === name)
            
            if (index === -1) {
                return res.status(404).json("Item not found in cache");
            }

            //update item in items cache
            items[index] = {...items[index], ...item}
            
            await client.sendCommand(['DEL', `items`])
            await client.sendCommand(['RPUSH', 'items', ...items.map((item) => JSON.stringify(item))])
        
            // update item in category list cache
            for(const category of items[index].category) {
                const itemCategory = category
                const categoryExist = await client.exists(`${itemCategory}`)
                if(categoryExist === 1) {
                    const cachedCategory = await client.sendCommand(['LRANGE', `${itemCategory}`, '0', '-1'])
                    const categoryItems: Item[] = cachedCategory.map((item: any) => JSON.parse(item))
                    const index = categoryItems.findIndex((item: Item) => item.name === name)
                    if (index != -1) {
                        categoryItems[index] = {...categoryItems[index], ...item}
                    }

                    await client.sendCommand(['DEL', `${itemCategory}`])
                    await client.sendCommand(['RPUSH', `${itemCategory}`, ...categoryItems.map((item) => JSON.stringify(item))])
                    console.log(`Removed item from ${itemCategory} cache`)
                }
            }
            
            //delete old categories
            for(const category of oldCategories) {
                await client.sendCommand(['DEL', `${category}`])
            }
        }

        return res.status(200).json("Item was successfully updated")
    } catch(error) {
        console.error(error)
        res.status(500).json(`Internal server error ${error}`)
    }
})

router.route('/item/:name/review').put(async(req: Request, res: Response) : Promise<any> => {
    const {name} = req.params
    const {review} = req.body
    
    try{
        // update item then validate cache again
        const itemUpdated = await Items.findOneAndUpdate(
            {name: name}, 
            { $push: {reviews: review}}, 
            { new: true}
        )

        if(!itemUpdated) {
            res.status(404).json("Error retrieving item, make sure item name exists")
        }

        const itemsExists = await client.exists('items')

        if(itemsExists === 1) {
            const cachedItems = await client.sendCommand(['LRANGE', `items`, '0', '-1'])
            //remove item from items list
            const items: Item[] = cachedItems.map((item: any) => JSON.parse(item))
            //add new updated item to list
            //get index of item to update so it can be done in-place
            const index = items.findIndex((item: Item) => item.name === name)
            
            if (index === -1) {
                return res.status(417).json("Item not found in items cache");
            }


            if(items[index].reviews.length === 0) {
                items[index].reviews = [review]
            } else{
                items[index].reviews.push(review)
            }

            await client.sendCommand(['DEL', `items`])
            await client.sendCommand(['RPUSH', 'items', ...items.map((item) => JSON.stringify(item))])
         
            // update item in category list cache
            for(const category of items[index].category) {
                const itemCategory = category
                const categoryExist = await client.exists(`${itemCategory}`)
                if(categoryExist === 1) {
                    const cachedCategory = await client.sendCommand(['LRANGE', `${itemCategory}`, '0', '-1'])
                    const categoryItems: Item[] = cachedCategory.map((item: any) => JSON.parse(item))
                    const index = categoryItems.findIndex((item: Item) => item.name === name)
                    if (index === -1) {
                        return res.status(413).json("Item not found in category cache")
                    }

                    if(categoryItems[index].reviews.length === 0) {
                        categoryItems[index].reviews = [review]
                    } else{
                        categoryItems[index].reviews.push(review)
                    }
                
                    await client.sendCommand(['DEL', `${itemCategory}`])
                    await client.sendCommand(['RPUSH', `${itemCategory}`, ...categoryItems.map((item) => JSON.stringify(item))])
                }
            }
        }

        return res.status(200).json("Successfully added review")
    } catch(error) {
        console.error(error)
        res.status(500).json(`Internal server error ${error}`)
    }
})

router.route('/item/:name/review').delete(async(req: Request, res: Response): Promise<any> => {
    const {name} = req.params
    const {review} = req.body

    try{
        const item = await Items.findOne({name: name})

        if(!item) {
            return res.status(404).json("Item name not found, please retry")
        }

        const reviewExists = item.reviews.some((r) => r.fullName === review.fullName);
     
        if(!reviewExists) {
            return res.status(400).json("Review doesn't exist!")
        }

        item.reviews.pull({ fullName: review.fullName });
        await item.save()


        // validate caches with updatedItem
        const itemsExists = await client.exists('items')

        if(itemsExists === 1) {
            const cachedItems = await client.sendCommand(['LRANGE', `items`, '0', '-1'])
            //remove item from items list
            const items: Item[] = cachedItems.map((item: any) => JSON.parse(item))
            
            //add new updated item to list
            //get index of item to update so it can be done in-place
            const index = items.findIndex((item: Item) => item.name === name)
            
            if (index === -1) {
                return res.status(417).json("Item not found in items cache");
            }

            //update item in items and categories caches
            items[index].reviews = items[index].reviews.filter((currReview) => currReview.fullName === review.fullName)
            
            await client.sendCommand(['DEL', `items`])
            await client.sendCommand(['RPUSH', 'items', ...items.map((item) => JSON.stringify(item))])
            
            // update item in category list cache
            for(const category of items[index].category){
                const itemCategory = category
                const categoryExist = await client.exists(`${itemCategory}`)
                if(categoryExist === 1) {
                    const cachedCategory = await client.sendCommand(['LRANGE', `${itemCategory}`, '0', '-1'])
                    const categoryItems: Item[] = cachedCategory.map((item: any) => JSON.parse(item))
                    const index = categoryItems.findIndex((item: Item) => item.name === name)
                    if (index === -1) {
                        return res.status(413).json("Item not found in category cache")
                    }
    
                    categoryItems[index].reviews = items[index].reviews.filter((currReview) => currReview.fullName === review.fullName)
                
                    await client.sendCommand(['DEL', `${itemCategory}`])
                    await client.sendCommand(['RPUSH', `${itemCategory}`, ...categoryItems.map((item) => JSON.stringify(item))])
                }
            }
        }
        return res.status(200).json("Successfully deleted review")
    } catch(error) {
        console.error(error)
        res.status(500).json(`Internal server error: ${error}`)
    }
})

/**
 * Removes an item
 * @param {String} itemName The name of the item to remove
 * @returns {Number} The status code indicating whether request was successful or not
 */
router.route('/item/:name').delete(async(req,res) => {
    const {name} = req.params
    try{
        const removed = await Items.findOneAndDelete({name: name}) 
        if(!removed) {
            res.status(404).json("Item wasn't found")
            return
        }

        // remove item from items cache if it exists 
        const itemsExists = await client.exists('items')

        if(itemsExists === 1) {
            const cachedItems = await client.sendCommand(['LRANGE', `items`, '0', '-1'])
            const items: Item[] = cachedItems.map((item: any) => JSON.parse(item))

            const index = items.findIndex((item: Item) => item.name === name)

            
            if(index !== 1) {
                items.splice(index, 1)

                await client.sendCommand(['DEL', `items`])
                if(items.length != 0) {
                    await client.sendCommand(['RPUSH', 'items', ...items.map((item) => JSON.stringify(item))])
                }
            }
        }

        if(!removed.category || removed.category.length === 0) {
            res.status(201).json("Item successfully deleted")
            return
        }
       
        for(const category of removed.category) {
            const itemCategory = category
            const categoryExist = await client.exists(`${itemCategory}`)
            if(categoryExist === 1) {
                const cachedCategory = await client.sendCommand(['LRANGE', `${itemCategory}`, '0', '-1'])
                const categoryItems: Item[] = cachedCategory.map((item: any) => JSON.parse(item))
                const index = categoryItems.findIndex((item: Item) => item.name === name)
                if (index !== -1) {
                    delete categoryItems[index]
                    const validItems = categoryItems.filter(item => item !== undefined && item !== null);
                        
                    await client.sendCommand(['DEL', `${itemCategory}`])
                    
                    if(validItems.length != 0) {
                        await client.sendCommand(['RPUSH', `${itemCategory}`, ...validItems.map((item) => JSON.stringify(item))])
                    }   
                }
            }
        }

        res.status(200).json("Item successfully deleted")
        return
    } catch(error) {
        console.error(error)
        res.status(500).json("Internal server error")
    }
})

export default router