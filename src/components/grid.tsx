import { useEffect, useState } from 'react';
import { Row } from './row'
import './grid.css'

//FIX TYPE
interface Props{
  socket: any
  isConnected: boolean
  room: null | string
}

export const Grid = ({ room, socket, isConnected }: Props) => {

  const [ grid, setGrid ] = useState<string[][]>(new Array(7).fill('_').map(x => new Array(7).fill('_')))
  const [ gameStarted, setGameStared ] = useState<boolean>(false)
  const [ currentPlayer, setCurrentPlayer ] = useState<'X'|'O'>('X')
  const [ winner, setWinner ] = useState<null | string>(null)
  const [ gameOver, setGameOver ] = useState<boolean>(false)

  useEffect(() => {
    if (isConnected) {

      socket.on('receive-move', (newGrid: string[][], nextPlayer: 'X'|'O') => {
        setGrid(newGrid)
        setCurrentPlayer(nextPlayer)
      })

      socket.on('receive-game-over', (newGrid: string[][], winner: string) => {
        setGrid(newGrid)
        setWinner(winner)
        setGameOver(true)
      })
    }
  }, [isConnected]);


  const rows = [];
  for (let i = 0; i < 7; i++){
    rows.push(
      <Row
        gameOver={gameOver}
        gameStarted={gameStarted}
        setGameStared={setGameStared}
        currentPlayer={currentPlayer}
        setCurrentPlayer={setCurrentPlayer}
        grid={grid} 
        setGrid={setGrid} 
        rowId={i} 
        key={`row${i}`}
        socket={socket}
        setWinner={setWinner}
        setGameOver={setGameOver}
        room={room}
    />)
  }

  return (
    <div className='grid'>
      <div className='rowsContiner'>
        <h3 className='playerUp'>
          {gameOver
            ? `${winner} wins the match!`
            : !room
            ? 'Join room to start'
            : currentPlayer === 'X' 
            ? 'X to move'
            : 'O to move'
          }
        </h3>
        { rows }
      </div>
    </div>
  )
}