import { useEffect, useState } from 'react';
import { Row } from './row'

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

    const notValidElement = (row: number, col: number) => {
      return row > len || col > len || row < 0 || col < 0
    }

    const makeDirection = (rowAdjust: number, colAdjust: number) => {
      const checkDirection = (row: number, col: number, streak: number): boolean => {
        if (notValidElement(row, col)) return false
        if (streak === 4) return true
        return grid[row][col] === currentPlayer
          ? checkDirection(row + rowAdjust, col + colAdjust, streak + 1)
          : checkDirection(row + rowAdjust, col +  colAdjust, 0)
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
        { turn === 'X' ? 'Player 1 turn' : 'Player 2 turn' }
        { rows }
      </div>
    </div>
  )
}