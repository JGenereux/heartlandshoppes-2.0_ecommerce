const { createClient } = require('redis');

const client = createClient({
    url: 'redis://redis:6379'
});

client.on('error', (error: any) => {
    console.error('Redis client error: ', error)
})
async function connectRedis() {
    try{
        await client.connect()
        console.log('Connected to Redis')
    } catch(error) {
        console.log('Error connecting to Redis: ', error)
    }
}

connectRedis()

export { client };
  