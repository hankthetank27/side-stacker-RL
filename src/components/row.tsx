import { Dispatch, SetStateAction } from 'react';
import { Box } from './box';
import './row.css'

interface Props {
  rowId: number
  setGameStared: Dispatch<SetStateAction<boolean>>
  gameStarted: boolean
  setGrid: Dispatch<SetStateAction<string[][]>>
  grid: string[][]
  turn: 'X' | 'O'
}

export const Row = ({ turn, rowId, setGrid, grid, setGameStared, gameStarted }: Props) => {

  const makeAdder = (idx: number, direction: number) => {
    return () => {
      if (!gameStarted) setGameStared(true)
      
      const row = grid[rowId]
      while(row[idx] !== '_'){
        if (idx < 0 || idx >= grid.length) return 'handle row full'
        idx += direction
      }
      setGrid((grid) => 
        grid.map((row, i) => 
          i === rowId
            ? row.map((el, j) => j === idx ? turn : el)
            : row
        )
      )
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
      <button onClick={addLeft}> Add Left </button>
      { boxes }
      <button onClick={addRight}> Add Right </button>
    </div>
  )
}