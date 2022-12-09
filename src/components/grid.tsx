import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Row } from './row'
import './grid.css'

interface Props{
  grid: string[][]
  socket: any
  isConnected: boolean
  room: null | string
  playerId: string
  currentTurn: string
  gameStarted: boolean
  setGameStarted: Dispatch<SetStateAction<boolean>>
  setCurrentTurn: Dispatch<SetStateAction<string>>
  setGrid: Dispatch<SetStateAction<string[][]>>
}

export const Grid = ({
  gameStarted, 
  grid,setGrid ,playerId, 
  currentTurn, 
  setCurrentTurn, 
  room, socket, 
  isConnected 
}: Props) => {

  const [ currentPlayer, setCurrentPlayer ] = useState<'X'|'O'>('X')
  const [ winner, setWinner ] = useState<null | string>(null)
  const [ gameOver, setGameOver ] = useState<boolean>(false)

  useEffect(() => {
    if (isConnected) {

      socket.on('receive-move', (newGrid: string[][], nextPlayer: 'X'|'O', player: string) => {
        setGrid(newGrid)
        setCurrentPlayer(nextPlayer)
        setCurrentTurn(player)
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
        playerId={playerId}
        currentTurn={currentTurn}
        setCurrentTurn={setCurrentTurn}
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
            : !gameStarted
            ? 'Waiting for other player to join...'
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