import { Row } from './row'
import './grid.css'
import { useEffect, useState } from 'react';

export const Grid = () => {

  const [ gameStarted, setGameStared ] = useState(false)
  const [ grid, setGrid ] = useState(new Array(7).fill('_').map(x => new Array(7).fill('_')))
  const [ turn, setTurn ] = useState<'X'|'O'>('X')

  useEffect(() => {
    if (!gameStarted) return

    turn === 'X'
      ? setTurn('O')
      : setTurn('X')

    if (checkWinner(grid, turn)){
      console.log(`${turn} wins`)
    }
  }, [ grid ])

  const checkWinner = (grid: string[][], currentPlayer: 'X'|'O') => {
    const len = grid.length - 1;
    const notValidElement = (row: number, col: number): boolean => {
      return row > len || col > len || row < 0 || col < 0
    }
    const checkRow = (row: number, col: number, streak: number): boolean => {
      if (notValidElement(row, col)) return false
      if (streak === 4) return true
      return grid[row][col] === currentPlayer
        ? checkRow(row, col + 1, streak + 1)
        : checkRow(row, col + 1, 0)
    }
    const checkCol = (row: number, col: number, streak: number): boolean => {
      if (notValidElement(row, col)) return false
      if (streak === 4) return true
      return grid[row][col] === currentPlayer
        ? checkCol(row + 1, col, streak + 1)
        : checkCol(row + 1, col, 0)
    }
    const checkDigLeft = (row: number, col: number, streak: number): boolean => {
      if (notValidElement(row, col)) return false
      if (streak === 4) return true
      return grid[row][col] === currentPlayer
        ? checkDigLeft(row + 1, col - 1, streak + 1)
        : checkDigLeft(row + 1, col - 1, 0)
    }
    const checkDigRight = (row: number, col: number, streak: number): boolean => {
      if (notValidElement(row, col)) return false
      if (streak === 4) return true
      return grid[row][col] === currentPlayer
        ? checkDigRight(row + 1, col + 1, streak + 1)
        : checkDigRight(row + 1, col + 1, 0)
    } 

    for (let i = 0; i < grid.length; i++){
      if (checkRow(i, 0, 0)) return true
      if (checkCol(0, i, 0)) return true

      if (checkDigLeft(i, len, 0)) return true
      if (checkDigLeft(0, len - i, 0)) return true

      if (checkDigRight(i, 0, 0)) return true
      if (checkDigRight(0, i, 0)) return true
    }
    return false
  }

  const rows = [];
  for (let i = 0; i < 7; i++){
    rows.push(
      <Row
        gameStarted={gameStarted}
        setGameStared={setGameStared}
        turn={turn} 
        grid={grid} 
        setGrid={setGrid} 
        rowId={i} 
        key={`row${i}`} 
    />)
  }

  return (
    <div className='grid'>
      <div className='rowsContiner'>
        { turn === 'X'
          ? 'Player 1 turn' 
          : 'Player 2 turn'
        }
        { rows }
      </div>
    </div>
  )
}