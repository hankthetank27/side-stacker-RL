import express, { Request, Response, NextFunction } from 'express'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url';
import { createServer } from 'http'
import path from 'path'
import cors from 'cors'
import { ExpressError, RoomData } from '../@types';
import pg from 'pg'

const { Pool } = pg
const PORT = process.env.PORT || 3000
const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
})
const db = new Pool({
  connectionString: 'postgres://vjtvwlqe:anDo7eaCh4AGYWvo586XOTZrLgDlnjvs@rajje.db.elephantsql.com/vjtvwlqe'
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

//postgres queries
const getRoomData = async (room: string, player: string, grid: string[][]) => {
  try{
    const query = `
      UPDATE rooms
      SET playerY = $1
      WHERE name = $2
      RETURNING playerX, playerY, currentTurn, boardState;`
    const roomEntry = await db.query(query, [player, room])
    if (roomEntry.rows.length){
      return roomEntry.rows[0]
    } else {
      const query = `
        INSERT INTO rooms (name, boardState, playerX, currentTurn, gameStatus) 
        VALUES ($1, $2, $3, $4, $5) RETURNING playerX, playerY, currentTurn, boardState;`
      const newRoom = await db.query(query, [room, JSON.stringify(grid), player, 'X', 'in progress'])
      return newRoom.rows[0]
    }
  } catch (err) {
    console.log(err)
  }
}

const insertMoveData = async (room: string, boardState: string[][], currentPlayer: string) => {
  try {
    const query = `
      UPDATE rooms
      SET boardState = $1, currentTurn = $2
      WHERE name = $3
      RETURNING playerX, playerY`
    const record = await db.query(query, [JSON.stringify(boardState), currentPlayer, room])
    return record.rows[0]
  } catch(err) {
    console.log(err)
  }
}

//handle websocket events
io.on('connection', (socket: any) => {

  socket.on('join-room', async (room: string, grid: string[][], callback: (roomData: RoomData) => {}) => {
    const clients = io.sockets.adapter.rooms.get(room)
    if (clients && clients.size >= 2) throw new Error('Room full')
    socket.join(room);
    const { 
      currentturn, 
      playerx, 
      playery, 
      boardstate 
    } = await getRoomData(room, socket.id, grid)
    callback({
      grid: JSON.parse(boardstate),
      room: room, 
      playerId: socket.id, 
      currentTurn: currentturn === 'X' ? playerx : playery
    })
    if (clients?.size === 2){
      io.in(room).emit('start-game')
    }
  })

  socket.on('make-move', async (grid: string[][], currentPlayer: string, room: string) => {
    const { playerx, playery } = await insertMoveData(room, grid, currentPlayer)
    const currentTurn = currentPlayer === 'X' ? playerx : playery
    socket.to(room).emit('receive-move', grid, currentPlayer, currentTurn)
  })

  socket.on('game-over', async (grid: string[][], winner: string, room: string) => {
    await insertMoveData(room, grid, winner)
    socket.to(room).emit('receive-game-over', grid, winner);
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