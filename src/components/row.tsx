import { Dispatch, SetStateAction, useState } from 'react';
import { Box } from './box';
import './row.css'

interface Props {
  grid: string[][]
  setGrid: Dispatch<SetStateAction<string[][]>>
  currentPlayer: 'X' | 'O'
  setCurrentPlayer: Dispatch<SetStateAction<'X'|'O'>>
  gameStarted: boolean
  setGameStared: Dispatch<SetStateAction<boolean>>
  rowId: number
  gameOver: boolean
  socket: any
  setWinner: Dispatch<SetStateAction<null | string>>
  setGameOver: Dispatch<SetStateAction<boolean>>
  room: null | string
}

export const Row = ({ room, setWinner, setGameOver, socket, gameOver, currentPlayer, setCurrentPlayer, rowId, setGrid, grid, setGameStared, gameStarted }: Props) => {

  const [ rowFull, setRowFull ] = useState<boolean>(false);

  const makeAdder = (idx: number, direction: number) => {
    return () => {
      if (!gameStarted) setGameStared(true)
      const row = grid[rowId]
      while(row[idx] !== '_'){
        if (idx < 0 || idx >= grid.length) return;
        idx += direction
      }
      if (idx + direction >= grid.length || idx + direction < 0){
        setRowFull(true);
      }
      const newGrid = grid.map((row, i) => 
        i === rowId
          ? row.map((el, j) => j === idx ? currentPlayer : el)
          : row
      )
      switchTurn(newGrid)
    }
  }
  
  const switchTurn = (newGrid: string[][], ) => {
    setGrid(newGrid)
    if (checkWinner(newGrid, currentPlayer)){
      setWinner(currentPlayer)
      setGameOver(true)
      socket.emit('game-over', newGrid, currentPlayer, room)
    } else {
      const nextPlayer = currentPlayer === 'X' ? 'O' : 'X'
      setCurrentPlayer(nextPlayer)
      socket.emit('make-move', newGrid, nextPlayer, room)
    }
  }

  const checkWinner = (grid: string[][], currentPlayer: 'X'|'O') => {
    const len = grid.length - 1;

    const invalidElement = (row: number, col: number) => {
      return row > len || col > len || row < 0 || col < 0
    }

    const makeDirection = (rowAdjust: number, colAdjust: number) => {
      const checkDirection = (row: number, col: number, streak: number): boolean => {
        if (streak === 4) return true
        if (invalidElement(row, col)) return false
        return grid[row][col] === currentPlayer
          ? checkDirection(row + rowAdjust, col + colAdjust, streak + 1)
          : checkDirection(row + rowAdjust, col + colAdjust, 0)
      }
      return checkDirection;
    }

    const checkRows = makeDirection(0, 1);
    const checkCols = makeDirection(1, 0);
    const checkDiRight = makeDirection(1, 1);
    const checkDiLeft = makeDirection(1, -1);

    for (let i = 0; i < grid.length; i++){
      if (checkRows(i, 0, 0)) return true
      if (checkCols(0, i, 0)) return true

      if (checkDiRight(i, 0, 0)) return true
      if (checkDiRight(0, i, 0)) return true
      
      if (checkDiLeft(i, len, 0)) return true
      if (checkDiLeft(0, len - i, 0)) return true
    }
    return false
  }

  const addLeft = makeAdder(0, 1)
  const addRight = makeAdder(grid.length - 1, -1)

  const boxes = []
  for (let i = 0; i < 7; i++){
    boxes.push(
      <Box 
        key={`box${i}`} 
        grid={grid} 
        boxId={ {row: rowId, col: i} }
    />)
  }

  return (
    <div className='row'>
      <button 
        className='button' 
        onClick={addLeft} 
        disabled={gameOver || rowFull || !room}
      >Add Left</button>
      { boxes }
      <button 
        className='button' 
        onClick={addRight} 
        disabled={gameOver || rowFull || !room}
      >Add Right</button>
    </div>
  )
}