import { Dispatch, SetStateAction, useState } from 'react';
import { Box } from './box';
import './row.css'

interface Props {
  grid: string[][]
  setGrid: Dispatch<SetStateAction<string[][]>>
  currentPlayer: 'X' | 'O'
  gameStarted: boolean
  setGameStared: Dispatch<SetStateAction<boolean>>
  rowId: number
  gameOver: boolean
}

export const Row = ({ gameOver, currentPlayer, rowId, setGrid, grid, setGameStared, gameStarted }: Props) => {

  const [ rowFull, setRowFull ] = useState<boolean>(false);

  const makeAdder = (idx: number, direction: number) => {
    return () => {
      if (!gameStarted) setGameStared(true)
      const row = grid[rowId]
      while(row[idx] !== '_'){
        if (idx < 0 || idx >= grid.length) return;
        idx += direction
      }
      setGrid((grid) => 
        grid.map((row, i) => 
          i === rowId
            ? row.map((el, j) => j === idx ? currentPlayer : el)
            : row
        )
      )
      if (idx + direction >= grid.length || idx + direction < 0){
        return setRowFull(true);
      }
    }
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
        disabled={gameOver || rowFull}
      >Add Left</button>
      { boxes }
      <button 
        className='button' 
        onClick={addRight} 
        disabled={gameOver || rowFull}
      >Add Right</button>
    </div>
  )
}