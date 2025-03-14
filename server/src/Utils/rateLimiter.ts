/**
 * A rate limiter middleware function that uses the Token Bucket Algorithm
 */
import { Request, Response, NextFunction } from 'express';
import { client } from '../../redis-client';

const TIME_LIMIT = 60 * 1000
const MAX_TOKENS = 10

interface Bucket {
    tokens: number,
    lastRefill: number
}

function createBucket() : Bucket {
    return {
        tokens: 10,
        lastRefill: Date.now()
    }
}

async function rateLimiter(req: Request, res: Response, next: NextFunction) : Promise<any> {
    const userIp = req.ip

    try{
        // Check if bucket exists
        const userExists = await client.exists(`${userIp}`)

        let userBucket: Bucket | null = null
        // retrieve bucket for user
        if(userExists !== 1) {
            userBucket = createBucket()
        } else {
            const currentBucket = await client.sendCommand(['GET', `${userIp}`])
            userBucket = JSON.parse(currentBucket)
        }

        if(userBucket === null) {
            return res.status(404).json('Error with rate limiter')
        }


        // retrieveToken
        if(!allowRequest(userBucket)) {
            return res.status(429).json("Exceeded requests allowed per minute")
        }

        // update user bucket in cache
        await client.sendCommand(['DEL', `${userIp}`])
        await client.sendCommand(['SET', `${userIp}`, JSON.stringify(userBucket), 'EX', '60']);
        next()
        return
    } catch{
        console.error()
        return res.status(500).json("Internal server error")
    }
}

function allowRequest(bucket: Bucket) {
    refillBucket(bucket)

    if(bucket.tokens > 0) {
        bucket.tokens -= 1
        return true
    }
    return false
}

function refillBucket(bucket: Bucket) {
    const currentTime = Date.now()
    const timeElapsed = currentTime - bucket.lastRefill
    
    // calculate how many tokens to add
    const tokensToAdd = Math.floor(timeElapsed / TIME_LIMIT)

    if(tokensToAdd > 0) {
        bucket.tokens = Math.min(MAX_TOKENS, bucket.tokens + tokensToAdd)
        bucket.lastRefill = currentTime
    }
}

export {rateLimiter}