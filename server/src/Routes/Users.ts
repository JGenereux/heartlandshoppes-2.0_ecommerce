import express from 'express';
import { User } from '../Interfaces/userInterface';

const router = express.Router();

/**
 * Adds a user to the Users db
 * @param {User} user The user's information
 * @returns {Number} status The status code indicating if the response was successful or not 
 */
router.post('/users', async(req,res) => {
    
})


export default router