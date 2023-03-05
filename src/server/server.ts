import express, { Request, Response } from 'express'
import { Server } from 'socket.io'
import { createServer } from 'http'
import next from 'next'
import pg from 'pg'
import { handleWebSockets } from './websockets.js'

const { Pool } = pg
const PORT = process.env.PORT || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()


app
  .prepare()
  .then(() => {

    const expressApp = express()
    const server = createServer(expressApp)
    const io = new Server(server, {
      cors: {
        origin: "http://localhost:3000",
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling'],
      allowEIO3: true
    })
    const db = new Pool({
      connectionString: 'postgres://vjtvwlqe:anDo7eaCh4AGYWvo586XOTZrLgDlnjvs@rajje.db.elephantsql.com/vjtvwlqe'
    })
    
    expressApp.use(express.json())
    expressApp.use(express.urlencoded({ extended: true }))
    
    handleWebSockets(io, db)

    expressApp.get('/api/yoda', (req, res) => {
      return res.json({'hello': 'brah'})
    })
    
    expressApp.get('*', (req: Request, res: Response) => {
      return handle(req, res)
    })
    
    expressApp.use((req: Request, res: Response) => res.status(404).send('page not found'));

    server.listen(PORT, () => {
      console.log(`Server listening on port: ${PORT}.`)
    })
  })
  .catch(ex => {
    console.error(ex.stack)
    process.exit(1)
})
