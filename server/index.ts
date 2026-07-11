import 'dotenv/config';
import express, { Express, Request, Response } from 'express'
import { MongoClient } from "mongodb"
import { callAgent } from './agent'

const app: Express = express()

import cors from 'cors'
app.use(cors())
app.use(express.json())

const client = new MongoClient(process.env.MONGODB_ATLAS_URI as string)

async function startServer() {
    try{
    await client.connect()
    await client.db("admin").command({ping: 1 })
    console.log("You successfuly connected to Mongodb!")

    app.get('/', async (req: Request, res: Response) => {
        res.send('LangGraph Agent Server')

        app.post('/chat', async (req: Request, res: Response) => {
            // Handle chat request
            const initialMessage = req.body.message
            const threadId = Date.now().toString() 
            console.log(initialMessage)
            try{
                const response = await callAgent(initialMessage, threadId, '')
                res.json({ threadId, response })

            } catch (error) {
                console.error('Error starting Conversation:', error)
                res.status(500).json({ error: 'Internal server error' })
            }
        })
        app.post('/chat/:threadId', async (req: Request<{ threadId: string }>, res: Response) => {
            const threadId = req.params.threadId
            const userMessage = req.body.message
            console.log(userMessage)
            try{
                const response = await callAgent(userMessage, threadId, '')
                res.json({response })
            } catch (error) {
                console.error('Error in chat:', error)
                res.status(500).json({ error: 'Internal server error' })
            }
        })

        const PORT = process.env.PORT || 3000
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })
    })

    } catch (error) {
        console.error('Error connecting to MongoDB:', error)
        process.exit(1)
    }
}

startServer()