import { RoomData } from '../@types';
import { Server } from 'socket.io';
import pg from 'pg'

export const handleWebSockets = (io: Server, db: pg.Pool) => {
   //postgres queries
   const getRoomData = async (room: string, player: 'X'|'O') => {
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
        const newRoom = await db.query(
          query,
          [room, JSON.stringify(new Array(7).fill('_').map(_ => new Array(7).fill('_'))), player, 'X', 'in progress']
        )
        return newRoom.rows[0]
      }
    } catch (err) {
      console.log(err)
    }
  }
  
  const insertMoveData = async (room: string, boardState: string[][], currentPlayer: 'X'|'O') => {
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
  
    socket.on('join-room', async (room: string, callback: (roomData: RoomData) => {}) => {
      const clients = io.sockets.adapter.rooms.get(room)
      if (clients && clients.size >= 2) throw new Error('Room full')
      socket.join(room);
      const { 
        currentturn, 
        playerx, 
        playery, 
        boardstate 
      } = await getRoomData(room, socket.id)
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
  
    socket.on('make-move', async (grid: string[][], currentPlayer: 'X' | 'O', room: string) => {
      const { playerx, playery } = await insertMoveData(room, grid, currentPlayer)
      const currentTurn = currentPlayer === 'X' ? playerx : playery
      socket.to(room).emit('receive-move', grid, currentPlayer, currentTurn)
    })
  
    socket.on('game-over', async (grid: string[][], winner: 'X' | 'O', room: string) => {
      await insertMoveData(room, grid, winner)
      socket.to(room).emit('receive-game-over', grid, winner);
    })
  
    socket.on('chat-message', async (message: string[], room: string) => {
      socket.to(room).emit('receive-chat-message', message)
    })
  
    socket.on('new-game', async (winner: 'X' | 'O', room: string) => {
      const newGrid = new Array(7).fill('_').map(_ => new Array(7).fill('_'))
      const { playerx, playery } = await insertMoveData(room, newGrid, winner)
      const currentTurn = winner === 'X' ? playerx : playery
      io.in(room).emit('receive-new-game', newGrid, currentTurn)
    })
  })
 }

 //module.exports.handleWebSockets = { handleWebSockets }