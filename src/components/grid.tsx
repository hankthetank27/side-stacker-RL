import { useEffect, useState } from 'react';
import { Row } from './row'
import './grid.css'

export const Grid = () => {

  const [ grid, setGrid ] = useState<string[][]>(new Array(7).fill('_').map(x => new Array(7).fill('_')))
  const [ gameStarted, setGameStared ] = useState<boolean>(false)
  const [ currentPlayer, setCurrentPlayer ] = useState<'X'|'O'>('X')
  const [ winner, setWinner ] = useState<null | string>(null)
  const [ gameOver, setGameOver ] = useState<boolean>(false)

  useEffect(() => {
    if (!gameStarted) return
    currentPlayer === 'X'
      ? setCurrentPlayer('O')
      : setCurrentPlayer('X')
    if (checkWinner(grid, currentPlayer)){
      setWinner(currentPlayer)
      setGameOver(true)
    }
  }, [ grid ])

  const checkWinner = (grid: string[][], currentPlayer: 'X'|'O') => {
    const len = grid.length - 1;

    const notValidElement = (row: number, col: number) => {
      return row > len || col > len || row < 0 || col < 0
    }

    const makeDirection = (rowAdjust: number, colAdjust: number) => {
      const checkDirection = (row: number, col: number, streak: number): boolean => {
        if (streak === 4) return true
        if (notValidElement(row, col)) return false
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

  const rows = [];
  for (let i = 0; i < 7; i++){
    rows.push(
      <Row
        gameOver={gameOver}
        gameStarted={gameStarted}
        setGameStared={setGameStared}
        currentPlayer={currentPlayer} 
        grid={grid} 
        setGrid={setGrid} 
        rowId={i} 
        key={`row${i}`} 
    />)
  }

  return (
    <div className='grid'>
      <div className='rowsContiner'>
        <h3 className='playerUp'>
          {gameOver
            ? `${winner} wins the match!`
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