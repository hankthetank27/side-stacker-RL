import { useEffect, useRef, useState } from 'react'
import { Grid } from '../components/grid'
import { Chat } from '../components/chat'
import { RoomData } from '../@types' 
import io from 'socket.io-client'

const socket = io('http://localhost:3000')

export default function Home() {

  // const socket = useRef(io('http://localhost:3000', {
  //   withCredentials: true
  // })).current

  const [ gameStarted, setGameStarted ] = useState<boolean>(false)
  const [ grid, setGrid ] = useState<string[][]>(new Array(7).fill('_').map(_ => new Array(7).fill('_')))
  const [ isConnected, setIsConnected ] = useState(socket.connected)
  const [ room, setRoom ] = useState<null | string>(null)
  const [ handleChange, setHandleChange ] = useState<string>('')
  const [ playerId, setPlayerId ] = useState<string>('');
  const [ currentTurn, setCurrentTurn ] = useState<string>('');

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    socket.on('start-game', () => {
      setGameStarted(true)
    })

    return () => {
      socket.off('connect')
      socket.off('disconnect')
    }
  }, [])

  const joinRoom = (e: any) => {
    e.preventDefault()
    socket.emit('join-room', handleChange, (roomData: RoomData) => {
      setGrid(roomData.grid)
      setRoom(roomData.room)
      setPlayerId(roomData.playerId)
      setCurrentTurn(roomData.currentTurn)
    })
    setHandleChange('')
  }

  return (
    <div className="App">
      <div className='gameContainer'>
        <Grid
          gameStarted={gameStarted}
          setGameStarted={setGameStarted}
          grid={grid}
          setGrid={setGrid}
          socket={socket}
          isConnected={isConnected}
          room={room}
          playerId={playerId}
          currentTurn={currentTurn}
          setCurrentTurn={setCurrentTurn}
        />
        <form className='roomForm' onSubmit={joinRoom}>
          <label> Enter Room To Join: 
            <input 
              type={'text'}
              value={handleChange}
              onChange={(e) => setHandleChange(e.target.value)}
            />
          </label>
        </form>
        <div>
          {room === null
            ? 'You are not currently in a room'
            : `In room: ${room}`}
        </div>
      </div>
      {gameStarted
        ? <Chat
            socket={socket}
            isConnected={isConnected}
            room={room}
            playerId={playerId}
          />
        : null
      }
    </div>
  )
}

