import { Dispatch, SetStateAction, useEffect } from 'react';
import { Box } from './box';
import './row.css'

interface Props {
  grid: string[][]
  currentPlayer: 'X' | 'O'
  rowId: number
  gameOver: boolean
  socket: any
  room: null | string
  playerId: string
  currentTurn: string
  gameStarted: boolean
  setGrid: Dispatch<SetStateAction<string[][]>>
  setWinner: Dispatch<SetStateAction<null | string>>
  setGameOver: Dispatch<SetStateAction<boolean>>
  setCurrentPlayer: Dispatch<SetStateAction<'X'|'O'>>
  setCurrentTurn: Dispatch<SetStateAction<string>>
}

export const Row = ({
  setCurrentTurn,
  currentTurn, 
  playerId, 
  room, 
  setWinner, 
  setGameOver, 
  socket, 
  gameOver, 
  currentPlayer, 
  setCurrentPlayer, 
  rowId, setGrid, 
  grid,  
  gameStarted 
}: Props) => {

  const makeAdder = (idx: number, direction: number) => {
    return () => {
      const row = grid[rowId]
      while(row[idx] !== '_'){
        if (idx < 0 || idx >= grid.length) return;
        idx += direction
      }
      const newGrid = grid.map((row, i) => 
        i === rowId
          ? row.map((el, j) => 
            j === idx 
              ? currentPlayer 
              : el)
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
    } else if (checkTie(newGrid)) {
      setWinner('No one')
      setGameOver(true)
      socket.emit('game-over', newGrid, currentPlayer, room)
    } else {
      const nextPlayer = currentPlayer === 'X' 
        ? 'O' 
        : 'X'
      setCurrentPlayer(nextPlayer)
      setCurrentTurn('');
      socket.emit('make-move', newGrid, nextPlayer ,room)
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

  const checkTie = (grid: string[][]) => {
    for (const row of grid){
      for (const col of row){
        if (col === '_') return false;
      }
    }
    return true;
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
        disabled={
          !gameStarted ||
          gameOver || 
          !room || 
          currentTurn != playerId
        }
      >Add Left</button>
      { boxes }
      <button 
        className='button' 
        onClick={addRight} 
        disabled={
          !gameStarted ||
          gameOver || 
          !room || 
          currentTurn != playerId
        }
      >Add Right</button>
    </div>
  )
}