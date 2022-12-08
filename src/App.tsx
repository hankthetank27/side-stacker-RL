import {  useEffect, useRef, useState } from 'react'
import { Grid } from './components/grid'
import './App.css'
import io from 'socket.io-client'

function App() {

  const socket = useRef(io('http://localhost:3000/')).current;
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [ room, setRoom ] = useState<null | string>(null)
  const [ handleChange, setHandleChange ] = useState('');

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  const joinRoom = (e: any) => {
    e.preventDefault()
    setRoom(handleChange)
    socket.emit('join-room', handleChange)
    setHandleChange('')
  }

  return (
    <div className="App">
      <Grid socket={socket} isConnected={isConnected} room={room}/>
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
  )
}

export default App
