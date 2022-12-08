import express, { Request, Response, NextFunction } from 'express'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url';
import  { createServer } from 'http'
import path from 'path'
import cors from 'cors'
import { ExpressError  } from '../@types';

const PORT = process.env.PORT || 3000
const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, '../../dist')))
} else {
  app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
    credentials: true
  }))
}

//handle websocket events
io.on('connection', (socket: any) => { 

  socket.on('join-room', (room: any) => {
    console.log(`${socket.id} joined room ${room}`)
    socket.join(room);
  })

  socket.on('make-move', (grid: string[][], currentPlayer: string, room: string) => {
    socket.to(room).emit('receive-move', grid, currentPlayer);
  })

  socket.on('game-over', (grid: string[][], winner: string, room: string) => {
    socket.broadcast.emit('receive-game-over', grid, winner);
  })
})

app.use((req: Request, res: Response) => res.status(404).send('page not found'));

//global error handler
app.use((err: ExpressError, req: Request, res: Response, next: NextFunction) => {
  const defaultErr = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: { err: 'An error occurred' },
  };
  const errorObj = Object.assign({}, defaultErr, err);
  console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});

server.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}.`)
});